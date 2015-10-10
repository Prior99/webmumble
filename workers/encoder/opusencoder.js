/*
 *  This file is part of Bumble, a browser based client for mumble.
 *
 *  Bumble is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Bumble is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Bumble. If not, see <http://www.gnu.org/licenses/>.
 */
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

/**
 * Called when a frame was generated.
 * @callback OpusEncoder~FrameCallback
 * @param {Uint8Array} output - A buffer containing the generated frame.
 */
/**
 * Called when an error occured during encoding or setup of the encoder.
 * @callback OpusEncoder~ErrorCallback
 * @param {object} error - The error thrown by the encoder.
 */
/**
 * This module is a wrapper aroung libopus which can be used in order to encode raw pcm audio (signed float32) into opus frames.
 * @constructor
 * @param {object} e - The configuration passed to this encoder.
 * @param {number} e.sampleRate - The sample rate used by as well the incoming as the outgoing audio in hertz. Defaults to 48000.
 * @param {number} e.channels - The amount of channels used in the audio. If more than one channel is used the data for all
 *                              channels needs to be stored interleaved. Default is 1.
 * @param {number} e.application - The application for which this encoder should optimise. Default is 2049. Please refer to
 *                                 https://www.opus-codec.org/docs/html_api-1.1.0/group__opus__encoder.html for further information.
 * @param {ErrorCallback} e.onerror - Called when an error occurs.
 * @param {FrameCallback} e.onframe - Called when a frame was generated.
 */
var OpusEncoder = function(e) {
	this.sampleRate = e.sampleRate || 48000; // Setup sample rate. Defaults to 48kHz
	this.channels = e.channels || 1; // Setup channels. Defaults to 1. Please note that more than 1 channel are currently not supported
	this.application = e.application || 2049; // Setup application. Defaults to 2049 which equals full band audio. Can be set to 2048 for voice only
	this.frameSize = this.sampleRate / 100; // Send 10ms of audio each packet
	this.onerror = e.onerror || function() {};
	this.onframe = e.onframe || function() {};

	var error = allocate(4, 'i32', ALLOC_STACK); // Allocate an integer pointer to write error of opus encoder into
	this._encoder = _opus_encoder_create(this.sampleRate, this.channels, this.application, error); // Create opus encoder and save pointer
	error = getValue(error, 'i32'); // Read error of opus encoder creation
	if(error != 0) { // Throw error if error occured
		this.onerror(new Error("error creating opus encoder: " + errorCodes[error]));
	}
	// Allocate a buffer to store input in for encoding
	this.maxInputBufferLength = this.frameSize * this.channels; // Length equals size of one frame multiplied by amount of channels
	this.inputBufferPointer = _malloc(this.maxInputBufferLength * 4); // 32bit = 4 byte
	this.inputBuffer = HEAPF32.subarray(this.inputBufferPointer / 4, (this.inputBufferPointer / 4) + this.maxInputBufferLength); // Save array associated with pointer for use in js
	// Allocate a buffer to store output in after encoding
	this.maxOutputBufferLength = this.maxInputBufferLength * 4; // Allocate the same size as the input buffer
	this.outputBufferPointer = _malloc(this.maxOutputBufferLength);
	this.outputBuffer = HEAPU8.subarray(this.outputBufferPointer, this.outputBufferPointer + this.maxOutputBufferLength); // Save array ssociated with pointer for use in js

	this.bufferIndex = 0; // Attribute for continuous encoding
	this.totalOutputLength = 0; // Total length already encoded
};

/**
 * Makes the encoder encode a buffer of raw pcm audi data in the format as specified in the constructor.
 * Will call the respective callback when a frame is generated. Please note that depending on the size of
 * the buffer more than one or even no frames will be created.
 * @param {ArrayBuffer} data - The data which should be encoded.
 */
OpusEncoder.prototype.encode = function(data) {
	for(var index = 0; index < data.length; ) { // Iterate over the input data
		var inputSamples = Math.min(data.length - index, this.frameSize - this.bufferIndex); // The amount of data we need to copy depends on how much data is already in the buffer.
		this.inputBuffer.set(data.subarray(index, index + inputSamples), this.bufferIndex); // Copy the new data into the buffer.
		index += inputSamples; // Increase index for reading input data depending on how much samples were consumed.
		this.bufferIndex += inputSamples; // Also increase the index of data in the buffer.
		if(this.bufferIndex == this.frameSize) { // The buffer now contains enough data to generate a frame.
			// Now do the magic and call the encoder in order to encode the prepared frame. It will be read from the input buffer and the output will be
			// written into the output buffer. Store the length of the generated frame in bytes in a variable for later use.
			var length = _opus_encode_float(this._encoder, this.inputBufferPointer, this.frameSize, this.outputBufferPointer, this.maxOutputBufferLength);
			if(length < 0) { // If the length is less than 0 it indicates an error.
				this.onerror(new Error("Error encoding buffer: " + errorCodes[length])); // Emit an error.
			}
			else {
				var output = this.outputBuffer.subarray(0, length); // Grab the subarray representing the encoded frame based on it's length.
				this.totalOutputLength += length; // Increase total length in case someone needs it.
				this.onframe(output); // Emit a new frame.
			}
			this.bufferIndex = 0; // Reset index in buffer to begin to fill it from the beginning.
		}
	}
};
