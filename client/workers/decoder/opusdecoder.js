importScripts('../libopus.js');

var errorCodes = {
	'0' : 'OPUS_OK',
   '-1' : 'OPUS_BAD_ARG',
   '-2' : 'OPUS_BUFFER_TOO_SMALL',
   '-3' : 'OPUS_INTERNAL_ERROR',
   '-4' : 'OPUS_INVALID_PACKET',
   '-5' : 'OPUS_UNIMPLEMENTED',
   '-6' : 'OPUS_INVALID_STATE',
   '-7' : 'OPUS_ALLOC_FAIL'
};

var OpusDecoder = function(e) {
	this.sampleRate = e.sampleRate || 48000; // Setup sample rate. Defaults to 48kHz
	this.channels = e.channels || 1; // Setup channels. Defaults to 1. Please note that more than 1 channel are currently not supported
	this.frameSize = this.sampleRate / 100; // Send 10ms of audio each packet
	this.onerror = e.onerror || function() {};
	this.onpcm = e.onpcm || function() {};

	var error = allocate(4, 'i32', ALLOC_STACK); // Allocate an integer pointer to write error of opus decoder into
	this._decoder = _opus_decoder_create(this.sampleRate, this.channels, error); // Create opus decoder and save pointer
	error = getValue(error, 'i32'); // Read error of opus decoder creation
	if(error != 0) { // Throw error if error occured
		this.onerror(new Error("error creating opus encoder: " + errorCodes[error]));
	}
	// Allocate a buffer to store decoded output in
	this.maxOutputBufferLength = this.frameSize * this.channels; // Length equals size of one frame multiplied by amount of channels
	this.outputBufferPointer = _malloc(this.maxInputBufferLength * 4); // 32bit = 4 byte
	this.outputBuffer = HEAPF32.subarray(this.outputBufferPointer / 4, (this.outputBufferPointer / 4) + this.maxOutputBufferLength); // Save array associated with pointer for use in js
	// Allocate a buffer to store input for decoding in
	this.maxInputBufferLength = this.maxOutputBufferLength * 4; // Allocate the same size as the output buffer
	this.inputBufferPointer = _malloc(this.maxInputBufferLength);
	this.inputBuffer = HEAPU8.subarray(this.inputBufferPointer, this.inputBufferPointer + this.maxInputBufferLength); // Save array ssociated with pointer for use in js

	this.totalOutputLength = 0; // Total length already decoded
};

OpusDecoder.prototype.decode = function(data) {
	this.inputBuffer.set(data);
	var length = _opus_decode_float(this._decoder, this.inputBufferPointer, data.length, this.outputBufferPointer, this.frameSize, 0);
	if(length < 0) {
		this.onerror(new Error("Error decoding buffer: " + errorCodes[length]));
	}
	else {
		var output = this.outputBuffer.subarray(0, length);
		this.totalOutputLength += length;
		this.onpcm(output);
	}
};
