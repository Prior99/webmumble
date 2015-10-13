var Audio = require('./audio');
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
var Command = require('./command');

var Bumble = function(obj) {
	this.websocketUrl = obj.websocketUrl;
	this.audio = new Audio({
		sampleRate : obj.sampleRate,
		bufferSize : obj.bufferSize
	});
	this.audio.on('error', this._onError.bind(this));
	this.command = new Command();
};

Util.inherits(Bumble, EventEmitter);

Bumble.prototype.start = function() {
	this._acquireAudio();
};

Bumble.prototype._setupWebsocket = function() {
	this.socket = new BinaryClient(this.websocketUrl);
	this.socket.binaryType = "arraybuffer";
	this.socket.on('open', this._websocketOpened.bind(this));
	this.socket.on('stream', this._onStream.bind(this))
};

Bumble.prototype._onStream = function(stream) {
	stream.on('data', function(data) {
		if(data.type === "input") {
			this.audio.setInputStream(stream);
		}
		else if(data.type === "output") {
			this.audio.addOutputStream(stream);
		}
		else if(data.type === "command") {
			this.command.setStream(stream);
		}
	}.bind(this));
};

Bumble.prototype.joinServer = function(server, port, username, password) {
	this.command.joinServer(server, port, username, password);
};

Bumble.prototype._acquireAudio = function() {
	navigator.getUserMedia({ audio: true }, this._audioAcquired.bind(this),  this._onError.bind(this));
};

Bumble.prototype._setupAudio = function() {
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

module.exports = Bumble;
