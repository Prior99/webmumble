var Mumble = require("mumble");
var Audio = require("./audio");
var Command = require("./command");

var Client = function(socket, clients){
	this.socket = socket;
	this.audio = new Audio(socket);
	this.command = new Command(socket);
	this.command.on("connect", this.connect.bind(this));
	this.command.on("join-channel", this.joinChannel.bind(this))
};

Client.prototype.retreiveChannels = function(){
	var channelList = { children : [] };
	var channelsToProcess = [{channel: this.mumble.rootChannel, parent: channelList}];
	var channelInfo, channel, parent;
	while(channelsToProcess.length) {
		channelInfo = channelsToProcess.shift();
		parent = channelInfo.parent;
		channel = channelInfo.channel;
		var users = []
		for(var i = 0; i < channel.users.length; i++){
			var user = channel.users[i];
			users.push({
				name: user.name,
				session : user.session,
				id : user.id
			});
		}
		channeldata = {
			name: channel.name,
			users: users,
			children: [],
			id : channel.id,
			position : channel.position
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

Client.prototype.onMumbleInit = function() {
	this.audio.setupMumble(this.mumble);
	this.mumble.on("user-connect", this.command.onUserConnect.bind(this.command));
	this.mumble.on("user-move", this.command.onUserMove.bind(this.command));
	this.mumble.on("user-disconnect", this.command.onUserDisconnect.bind(this.command));
	
	this.mumble.on("error", this.onMumbleError.bind(this))
	this.command.onMumbleInit(this.retreiveChannels());
};

Client.prototype.onMumbleError = function(err) {
	console.error(err);
};

Client.prototype.joinChannel = function(id, done) {
	var channel = this.mumble.channelById(id);
	if(channel) {
		channel.join();
		done(true);
	}
	else {
		done(false);
	}
};

Client.prototype.connect = function(args, done) {
	this.username = args.username;
	this.password = args.password;
	this.server = args.server;
	this.port = args.port;
	Mumble.connect("mumble://" + args.server + ":" + args.port, {}, function(err, connection) {
		if(!err) {
			this.mumble = connection;
			connection.on("initialized", this.onMumbleInit.bind(this));
			connection.authenticate(this.username, this.password);
			done(true);
		}
		else {
			done(false);
		}
	}.bind(this));
};

module.exports = Client;
