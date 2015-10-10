importScripts('libopus.js', 'resampler.js', 'oggencoder.js');

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

this.onmessage = function(e) {
	var evt = e.data;
	if(evt.command == 'init') {
		var channels = 1;
		this.encoder = new Encoder({
			sampleRate : evt.outputSampleRate,
			channels : channels,
			application : evt.application,
			keepFrames : evt.keepFrames
		}, this);
		this.resampler = new Resampler({
			resampledRate : evt.outputSampleRate,
			originalSampleRate : evt.inputSampleRate,
			numberOfChannels : channels
		});
	}
	else if(evt.command == 'encode') {
		var data = this.resampler.resample(evt.data, 0);
		this.encoder.encode(data);
	}
	else {
		console.log("Unknown command: ", evt.command);
	}
}.bind(this);

var Encoder = function(e, worker) {

	this.worker = worker;

	this.keepFrames = e.keepFrames;
	this.sampleRate = e.sampleRate;
	this.channels = e.channels;
	this.application = 2049;
	this.frameSize = this.sampleRate / 100;

	this.ogg = new OggEncoder({
		channels : this.channels,
		sampleRate : this.sampleRate,
		callback : function(packets) {
			while(packets.length) {
				worker.postMessage(packets.shift());
			}
		}.bind(this)
	});

	var error = allocate(4, 'i32', ALLOC_STACK);
	this._encoder = _opus_encoder_create(this.sampleRate, this.channels, this.application, error);
	error = getValue(error, 'i32');
	if(error != 0) {
		console.log("Error creating opus encoder: " + errorCodes[error]);
	}

	this.maxInputBufferLength = this.frameSize * this.channels;
	this.inputBufferPointer = _malloc(this.maxInputBufferLength * 4); //32bit = 4 byte
	this.inputBuffer = HEAPF32.subarray(this.inputBufferPointer / 4, (this.inputBufferPointer / 4) + this.maxInputBufferLength);

	this.maxOutputBufferLength = this.maxInputBufferLength * 4;
	this.outputBufferPointer = _malloc(this.maxOutputBufferLength); //1 Byte
	this.outputBuffer = HEAPU8.subarray(this.outputBufferPointer, this.outputBufferPointer + this.maxOutputBufferLength);

	this.bufferIndex = 0;
	this.totalOutputLength = 0;
};

Encoder.prototype.encode = function(data, callback) {
	var totalOutputLength = 0;
	for(var index = 0; index < data.length; ) {
		var inputSamples = Math.min(data.length - index, this.frameSize - this.bufferIndex);
		this.inputBuffer.set(data.subarray(index, index + inputSamples), this.bufferIndex);
		index += inputSamples;
		this.bufferIndex += inputSamples;
		if(this.bufferIndex == this.frameSize) {
			var length = _opus_encode_float(this._encoder, this.inputBufferPointer, this.frameSize, this.outputBufferPointer, this.maxOutputBufferLength);
			this.totalOutputLength += length;
			if(length < 0) {
				console.log("Error encoding buffer: " + errorCodes[length]);
			}
			else {
				var output = this.outputBuffer.subarray(0, length);
				this.totalOutputLength += length;
				this.ogg.pushFrame(output);
			}
			this.bufferIndex = 0;
		}
	}
};
/*
Encoder.prototype.flush = function() {
	var buffer = new Uint8Array(this.totalOutputLength);
	var computed = 0;
	while(this.outputs.length) {
		var output = this.outputs.shift();
		buffer.set(output, computed);
		computed += output.length;
	}
	this.totalOutputLength = 0;
	this.worker.postMessage(buffer);
}*/
