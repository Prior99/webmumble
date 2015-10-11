var Util = require('util');
var EventEmitter = require('events').EventEmitter;

var AudioOutput = function(bufferSize, outputSampleRate, inputSampleRate) {
	this.bufferSize = bufferSize;
	this.decoder = new Worker("workers/decoder/decoder.js");
	this.decoder.postMessage({
		command : 'init',
		outputSampleRate : outputSampleRate,
		inputSampleRate : inputSampleRate
	});
	this.buffers = [];
	this.currentBuffer = new Float32Array(bufferSize);
	this.bufferIndex = 0;
	this.decoder.addEventListener('message', this._onMessage.bind(this));
};

Util.inherits(AudioOutput, EventEmitter);

AudioOutput.prototype.process = function(data) {
	this.decoder.postMessage({
		command : 'decode',
		data : data
	});
};

AudioOutput.prototype.onAudioProcess = function(event) {
	if(this.buffers.length) {
		var data = this.buffers.shift();
		event.outputBuffer.getChannelData(0).set(data);
	}
};

AudioOutput.prototype._onMessage = function(event) {
	var obj = event.data;
	if(obj.type === 'error') {
		console.error(obj.error);
	}
	else if(obj.type === 'pcm') {
		this._onPCM(obj.pcm);
	}
};

AudioOutput.prototype._onPCM = function(data) {
	for(var index = 0; index < data.length; ) {
		var lengthToCopy = Math.min(this.bufferSize - this.bufferIndex, data.length - index);
		this.currentBuffer.set(data.subarray(index, index + lengthToCopy), this.bufferIndex);
		this.bufferIndex += lengthToCopy;
		index += lengthToCopy;
		if(this.bufferIndex === this.bufferSize) {
			this.buffers.push(this.currentBuffer.slice());
			this.bufferIndex = 0;
		}
	}
};

AudioOutput.prototype._onError = function(error) {
	this.emit('error', error);
};

module.exports = AudioOutput;
