var AudioInput = require("./input");
var AudioOutput = require("./output");

var Audio = function(socket) {
	this.socket = socket;
	this.outputs = {};
};

Audio.prototype.setupInput = function() {
	this.input = new AudioInput(this.mumble.inputStream(), this.socket.createStream());
};

Audio.prototype.setupMumble = function(mumble) {
	this.mumble = mumble;
	this.setupInput();
	this.mumble.on("user-connect", this.createOutput.bind(this));
	this.mumble.on("user-disconnect", this.destroyOutput.bind(this));
	this.mumble.users().forEach(function(user) {
		this.createOutput(user);
	}.bind(this));
};

Audio.prototype.createOutput = function(user) {
	if(this.outputs[user.session]) {
		return;
	}
	var output = new AudioOutput(user, this.socket.createStream());
	this.outputs[user.session] = output;
};

Audio.prototype.destroyOutput = function(user) {
	if(!this.outputs[user.session]) {
		return;
	}
	var output = this.outputs[user.session];
	output.close();
	this.outputs[user.session] = undefined;
};

module.exports = Audio;
