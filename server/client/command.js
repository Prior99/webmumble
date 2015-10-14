var CommandProtocol = require("../../shared/command");
var EventEmitter = require('events').EventEmitter;
var Util = require('util');

var Command = function(socket) {
	this.stream = socket.createStream();
	this.stream.write({
		type : "command"
	});
	this.remote = new CommandProtocol(this.stream);
	this.remote.on("joinServer", this.onJoinServer.bind(this));
	this.remote.on("joinChannel", this.onJoinChannel.bind(this));
};

Util.inherits(Command, EventEmitter);

Command.prototype.onMumbleInit = function(channels) {
	this.remote.send("channels", channels);
};

Command.prototype.onUserConnect = function(user) {
	this.remote.send("user-connect", {
		name: user.name,
		session : user.session
	});
};

Command.prototype.onUserMove = function(user, oldChannel, newChannel) {
	this.remote.send("user-move", {
		user: user.session,
		oldChannel: oldChannel.id,
		newChannel: newChannel.id
	});
};

Command.prototype.onUserDisconnect = function(user) {
	this.remote.send("user-disconnect", user.name);
};

Command.prototype.onJoinChannel = function(id, done) {
	this.emit("join-channel", id, done);
};

Command.prototype.onJoinServer = function(args, done) {
	this.emit("connect", {
		username : args.username,
		password : args.password,
		server : args.server,
		port : args.port
	}, done);
};

module.exports = Command;
