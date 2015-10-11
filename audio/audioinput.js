var Util = require('util');
var EventEmitter = require('events').EventEmitter;

var AudioInput = function(bufferSize, outputSampleRate, inputSampleRate) {
	this.bufferSize = bufferSize;
	this.encoder = new Worker("workers/encoder/encoder.js");
	this.encoder.postMessage({
		command : 'init',
		outputSampleRate : outputSampleRate,
		inputSampleRate : inputSampleRate
	});
	this.encoder.addEventListener('message', this._onMessage.bind(this));
};

Util.inherits(AudioInput, EventEmitter);

AudioInput.prototype.onAudioProcess = function(event) {
	this.encoder.postMessage({
		command : 'encode',
		data : event.inputBuffer.getChannelData(0)
	});
};

AudioInput.prototype._onMessage = function(event) {
	var obj = event.data;
	if(obj.type === 'error') {
		this._onError(obj.error);
	}
	else if(obj.type === 'packet') {
		this._onPacket(obj.packet);
	}

};

AudioInput.prototype._onError = function(error) {
	this.emit('error', error);
};

AudioInput.prototype._onPacket = function(packet) {
	this.emit('packet', packet);
};

module.exports = AudioInput;
