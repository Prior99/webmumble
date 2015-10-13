var Mumble = require("mumble");
var Audio = require("./audio");
var Command = require("./command");

var Client = function(socket, clients){
	this.socket = socket;
	this.audio = new Audio(socket);
	this.command = new Command(socket);
	this.command.on("connected", this.onMumbleInit.bind(this));
};

Client.prototype.onMumbleInit = function(mumble) {
	this.mumble = mumble;
	this.audio.setupMumble(this.mumble);
};

module.exports = Client;
