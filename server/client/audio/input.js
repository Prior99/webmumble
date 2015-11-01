var Opus = require('node-opus');
var Ogg = require('ogg');
var MumbleFormat = require('./format');
var EventEmitter = require('events').EventEmitter;
var Util = require('util');

var AudioInput = function(mumbleInputStream, stream) {
	this.mumbleInputStream = mumbleInputStream;
	this.stream = stream;
	this.stream.write({
		type : "input"
	});
	this.opus = new Opus.Decoder();
	this.oggDecoder = new Ogg.Decoder();
	this.oggDecoder.on('stream', this.onOggStream.bind(this));
	this.stream.pipe(this.oggDecoder);
};

Util.inherits(AudioInput, EventEmitter);

AudioInput.prototype.onOggStream = function(stream) {
	this.opus.on('format', this.onOpusFormat.bind(this));
	this.opus.on('error', this.onOpusError.bind(this));
	stream.pipe(this.opus);
};

AudioInput.prototype.onOpusError = function(err) {
	this.emit('error', err)
};

AudioInput.prototype.onOpusFormat = function(format) {
	this.format = format;
	if(this.format.sampleRate !== MumbleFormat.sampleRate) {
		this.emit('error', new Error("Unsupported sample rate: ",
			this.format.sampleRate, "but", MumbleFormat.sampleRate, "was required."));
	}
	else if(this.format.channels !== MumbleFormat.channels) {
		this.emit('error', new Error("Unsupported number of channels: ", this.format.channels,
			"but", MumbleFormat.channels, "was required."));
	}
	else {
		this.opus.pipe(this.mumbleInputStream);
	}
};

module.exports = AudioInput;
