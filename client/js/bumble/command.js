var CommandProtocol = require("../../../shared/command");
var ChannelTree = require("../channelTree");
var User = require("../user");
var Channel = require("../channel");
var Util = require('util');
var EventEmitter = require('events').EventEmitter;

var Command = function() {

};

Util.inherits(Command, EventEmitter);

Command.prototype.onChannels = function(channels, done) {
	this.emit("channels", channels);
};

Command.prototype.joinServer = function(server, port, username, password, done) {
	this.serverInfo = {
		server : server,
		port : port,
		username : username,
		password : password
	};
	this.remote.send("joinServer", this.serverInfo, done);
};

Command.prototype.joinChannel = function(path){
	this.socket.emit("joinChannel", path);
};

Command.prototype.onUserConnect = function(user){
	console.log("User " + user.name + " joined");
	this.channelTree.rootChannel.addUser(new User(user));
};

Command.prototype.onUserMove = function(args){
	console.log(args);
	console.log("User " + args.user + " moved from " + args.oldChannel + " to " + args.newChannel);
	this.channelTree.moveUser(args.user, args.newChannel);
};

Command.prototype.onUserDisconnect = function(user){
	console.log("User " + user + " disconnected");
	this.channelTree.findUser(user, function(user, channel){
		console.log("\t User found");
		channel.removeUser(user);
	});
};

Command.prototype.setStream = function(stream) {
	this.remote = new CommandProtocol(stream);
	//this.remote.on("joinedServer", this.onServerJoined.bind(this));
	this.remote.on("user-connect", this.onUserConnect.bind(this));
	this.remote.on("user-move", this.onUserMove.bind(this));
	this.remote.on("user-disconnect", this.onUserDisconnect.bind(this));
	this.remote.on("channels", this.onChannels.bind(this));
};

module.exports = Command;
