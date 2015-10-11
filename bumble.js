var Audio = require('./audio');
var Util = require('util');
var EventEmitter = require('events').EventEmitter;

var Bumble = function(obj) {
	this.websocketUrl = obj.websocketUrl;
	this.audio = new Audio({
		sampleRate : obj.sampleRate,
		bufferSize : obj.bufferSize
	});
	this.audio.on('error', this._onError.bind(this));
};

Util.inherits(Bumble, EventEmitter);

Bumble.prototype.start = function() {
	this._acquireAudio();
};

Bumble.prototype._setupWebsocket = function() {
	this.ws = new WebSocket(this.websocketUrl);
	this.ws.binaryType = "arraybuffer";
	this.ws.onopen = this._websocketOpened.bind(this);
	this.ws.onmessage = this._onMessage.bind(this);
};

Bumble.prototype._acquireAudio = function() {
	navigator.getUserMedia({ audio: true }, this._audioAcquired.bind(this),  this._onError.bind(this));
};

Bumble.prototype._setupAudio = function() {
	this.audio.on('packet', function(packet) {
		this.ws.send(packet);
	}.bind(this));
	this.audio.on('ready', function() {
		this.emit('ready');
	}.bind(this));
	this.audio.setupAudio(this.context, this.source, this.destination);
	this._setupWebsocket();
};

Bumble.prototype._audioAcquired = function(stream) {
	this.emit('audio-acquired');
	this.context = new AudioContext();
	this.source = this.context.createMediaStreamSource(stream);
	this.destination = this.context.destination;
	this._setupAudio();
};

Bumble.prototype._websocketOpened = function(stream) {
	this.emit('connected');
};

Bumble.prototype._onError = function(err) {
	this.emit('error', err);
};

Bumble.prototype._onMessage = function(message) {
	this.audio.message(message.data);
};

module.exports = Bumble;
