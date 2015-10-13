var Opus = require('node-opus');
var Ogg = require('ogg');
var EventEmitter = require('events').EventEmitter;
var Util = require('util');
var MumbleFormat = require('./format');

var AudioOutput = function(user, stream) {
	this.stream = stream;
	this.stream.write({
		type : "output",
		session : user.session
	});
	this.user = user;
	this.mumbleStream = this.user.outputStream(true);
	this.oggEncoder = new Ogg.Encoder();
	this.oggStream = this.oggEncoder.stream();
	this.opus = new Opus.Encoder(MumbleFormat.sampleRate, MumbleFormat.channels, MumbleFormat.frameSize);
	this.opus.on('data', this.onOpusData.bind(this));
	this.oggEncoder.pipe(this.stream);
	this.mumbleStream.pipe(this.opus);
};

Util.inherits(AudioOutput, EventEmitter);

AudioOutput.prototype.onOpusData = function(data) {
	this.oggStream.packetin(data);
};

module.exports = AudioOutput;
