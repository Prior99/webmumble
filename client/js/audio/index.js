var AudioInput = require('./audioinput');
var AudioOutput = require('./audiooutput');
var Util = require('util');
var EventEmitter = require('events').EventEmitter;

var Audio = function(obj) {
	this.sampleRate = obj.sampleRate;
	this.bufferSize = obj.bufferSize;
	this.channels = 1;
	this.sinkNodes = [];
	this.outputs = [];
};

Util.inherits(Audio, EventEmitter);

Audio.prototype.setInputStream = function(stream) {
	this.inputStream = stream;
	this.webSocketSourceNode = this.context.createScriptProcessor(this.bufferSize, this.channels, this.channels);
	this.input = new AudioInput(this.bufferSize, this.sampleRate, this.context.sampleRate);
	this.webSocketSourceNode.onaudioprocess = this.input.onAudioProcess.bind(this.input);
	this.source.connect(this.webSocketSourceNode);
	this.input.on('packet', function(packet) {
		stream.write(packet);
	}.bind(this));
	this.input.on('error', this._onError.bind(this));
};

Audio.prototype.addOutputStream = function(stream) {
	var webSocketSinkNode = this.context.createScriptProcessor(this.bufferSize, this.channels, this.channels);
	var output = new AudioOutput(this.bufferSize, this.context.sampleRate, this.sampleRate);
	webSocketSinkNode.onaudioprocess = output.onAudioProcess.bind(output);
	webSocketSinkNode.connect(this.destination);
	output.on('error', this._onError.bind(this));
	stream.on('data', function(data) {
		output.process(data);
	}.bind(this));
	this.outputs.push(output);
	this.sinkNodes.push(webSocketSinkNode);
};

Audio.prototype.setupAudio = function(context, source, destination) {
	this.context = context;
	this.source = source;
	this.destination = destination;
};

Audio.prototype._onError = function(err) {
	this.emit('error', err);
};

module.exports = Audio;
