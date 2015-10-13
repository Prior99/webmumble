var CommandProtocol = require("../../shared/command");
var EventEmitter = require('events').EventEmitter;
var Util = require('util');
var Mumble = require("mumble");

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

Command.prototype.retreiveChannels = function(){
	var channelList = { children : [] };
	var channelsToProcess = [{channel: this.mumble.rootChannel, parent: channelList}];
	var channelInfo, channel, parent;
	while(channelsToProcess.length) {
		channelInfo = channelsToProcess.shift();
		parent = channelInfo.parent;
		channel = channelInfo.channel;
		var users = []
		for(var i = 0; i < channel.users.length; i++){
			users.push({
				name: channel.users[i].name
			});
		}
		channeldata = {
			name: channel.name,
			users: users,
			children: [],
			id : channel.id
		}
		parent.children.push(channeldata);
		if(channel.children && channel.children.length){
			for(var i = 0; i < channel.children.length; i++){
				channelsToProcess.push({
					channel: channel.children[i],
					parent: channeldata
				});
			}
		}
	}
	return channelList.children[0];
};

Command.prototype.onMumbleInit = function() {
	this.remote.send("channels", {
		channels: this.retreiveChannels()
	});
	this.emit("connected", this.mumble);
};

Command.prototype.onUserConnect = function(user) {
	console.log("User " + user.name + " connected");
	this.remote.send("user-connect", {
		name: user.name,
		session : user.session
	});
};

Command.prototype.onUserMove = function(user, oldChannel, newChannel) {
	console.log("User " + user.name + " moved from " + oldChannel.name + " to " + newChannel.name);
	this.remote.send("user-move", {
		user: user.name,
		oldChannel: oldChannel.id,
		newChannel: newChannel.id
	});
};

Command.prototype.onUserDisconnect = function(user) {
	console.log("User " + user.name + " disconnected");
	this.remote.send("user-disconnect", user.name);
};

Command.prototype.initMumbleEvents = function() {
	this.mumble.on("user-connect", this.onUserConnect.bind(this));
	this.mumble.on("user-move", this.onUserMove.bind(this));
	this.mumble.on("user-disconnect", this.onUserDisconnect.bind(this));
};

Command.prototype.onJoinChannel = function(id, done) {
	if(channel) {
		channel.join();
		console.log("joining channel " + channel + " as " + this.server.username);
		done({
			okay : true
		});
	}
	else {
		done({
			okay : false
		});
	}
};

Command.prototype.onJoinServer = function(args, done) {
	this.username = args.username;
	this.password = args.password;
	this.server = args.server;
	this.port = args.port;
	console.log("Connecting to: "  + args.server + ":" + args.port + " as " + args.username);
	Mumble.connect("mumble://" + args.server + ":" + args.port, {}, function(err, connection) {
		if(!err) {
			this.mumble = connection;
			connection.on("initialized", this.onMumbleInit.bind(this));
			connection.authenticate(this.username, this.password);
			this.initMumbleEvents();
			done({
				okay : true
			});
		}
		else {
			this.emit("mumble-error", err);
			done({
				okay : false,
				error : err
			});
		}
	}.bind(this));
};

module.exports = Command;
