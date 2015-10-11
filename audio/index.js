var AudioInput = require('./audioinput');
var AudioOutput = require('./audiooutput');
var Util = require('util');
var EventEmitter = require('events').EventEmitter;

var Audio = function(obj) {
	this.sampleRate = obj.sampleRate;
	this.bufferSize = obj.bufferSize;
	this.channels = 1;
};

Util.inherits(Audio, EventEmitter);

Audio.prototype._setupInput = function() {
	this.webSocketSourceNode = this.context.createScriptProcessor(this.bufferSize, this.channels, this.channels);
	this.input = new AudioInput(this.bufferSize, this.sampleRate, this.context.sampleRate);
	this.webSocketSourceNode.onaudioprocess = this.input.onAudioProcess.bind(this.input);
	this.source.connect(this.webSocketSourceNode);
	this.input.on('packet', this._onPacket.bind(this));
	this.input.on('error', this._onError.bind(this));
};

Audio.prototype._onPacket = function(packet) {
	this.emit('packet', packet);
};

Audio.prototype._setupOutput = function() {
	this.webSocketSinkNode = this.context.createScriptProcessor(this.bufferSize, this.channels, this.channels);
	this.output = new AudioOutput(this.bufferSize, this.context.sampleRate, this.sampleRate);
	this.webSocketSinkNode.onaudioprocess = this.output.onAudioProcess.bind(this.output);
	this.webSocketSinkNode.connect(this.destination);
	this.output.on('error', this._onError.bind(this));
};

Audio.prototype.setupAudio = function(context, source, destination) {
	this.context = context;
	this.source = source;
	this.destination = destination;
	this._setupInput();
	this._setupOutput();
	this.emit('ready');
};

Audio.prototype._onError = function(err) {
	this.emit('error', err);
};

Audio.prototype.message = function(data) {
	this.output.process(data);
};

module.exports = Audio;
