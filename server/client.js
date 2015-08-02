var Mumble = require("mumble");

var Client = function(socket, clients){
	this.socket = socket;
	this.socket.on("joinServer", this.connect.bind(this));
	this.socket.on("joinChannel", this.joinChannel.bind(this));
}

Client.prototype = {
	assignAudioSocket: function(socket){
		this.audioSocket = socket;
		//TODO: pipe audio;
	},
	connect: function(args){
		console.log("Connecting to: "  + args.server + ":" + args.port + " as " + args.username);
		Mumble.connect("mumble://" + args.server + ":" + args.port, {}, function(error, connection){
			if(!error){
				this.mumble = connection;
				connection.on("initialized", this.onInit.bind(this));
				connection.on("voice", this.onVoice.bind(this));
				try{
					connection.authenticate(args.username, "");
					this.server = args;
					this.initMumbleEvents();
				}
				catch(e){
					console.error(e);
					this.socket.emit("mumble-error", e);
				}
			}
			else{
				this.socket.emit("mumble-error", error);
			}
		}.bind(this));
	},

	onInit: function(){
		this.socket.emit("joinedServer", {
			channels: this.retreiveChannels()
		});
	},

	onVoice: function(event){

	},

	joinChannel: function(channel){
		path = channel.split("/");
		while(path[0] === ""){
			path.shift();
		}
		if(path[0] !== this.mumble.rootChannel.name){
			console.err("Joining non existent channel \"" + channel + "\"!");
			this.socket.emit("mumble-error", {
				reason: "Channel does not exist",
				responseTo: "joinChannel",
				channel: channel
			});
			return;
		}
		var currentChannel = this.mumble.rootChannel;
		for(var i = 1; i < path.length; i++){
			if(path[i] === ""){
				continue;
			}
			var found = false;
			for(var j = 0; j < currentChannel.children.length; j++){
				if(currentChannel.children[j].name === path[i]){
					currentChannel = currentChannel.children[j];
					found = true;
					break;
				}
			}
			if(! found){
				this.socket.emit("mumble-error", {
					reason: "ChannelNotExist",
					responseTo: "joinChannel",
					channel: channel
				});
				return;
			}
		}
		currentChannel.join();
		console.log("joining channel " + channel + " as " + this.server.username);
		this.socket.emit("channelJoined", channel);
	},
	
	retreiveChannels: function(){
		var channelList = {children:[]};
		var channelsToProcess = [{channel: this.mumble.rootChannel, parent: channelList}];
		var channelInfo, channel, parent;
		while(channelsToProcess.length !== 0){
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
				children: []
			}
			parent.children.push(channeldata);
			if(channel.children !== undefined && channel.children.length !== 0){
				for(var i = 0; i < channel.children.length; i++){
					channelsToProcess.push({
						channel: channel.children[i],
						parent: channeldata
					});
				}
			}
		}
		//console.log(channelList.children[0]);
		return channelList.children[0];
	},
	
	initMumbleEvents: function(){
		this.mumble.on("user-connect", function(user){
			console.log("User " + user.name + " connected");
			this.socket.emit("user-connect",{
				name: user.name
			});
		}.bind(this));
		this.mumble.on("user-move", function(user, oldChannel, newChannel){
			console.log("User " + user.name + " moved from " + oldChannel.name + " to " + newChannel.name);
			this.socket.emit("user-move", {
				user: user.name,
				oldChannel: this.getChannelPath(oldChannel),
				newChannel: this.getChannelPath(newChannel)
			});
		}.bind(this));
		this.mumble.on("user-disconnect", function(user){
			console.log("User " + user.name + " disconnected");
			this.socket.emit("user-disconnect", user.name);
		}.bind(this));
	},
	
	getChannelPath: function(channel){
		var path = [];
		var currentChannel = channel;
		while(currentChannel !== undefined){
			path.unshift(currentChannel.name);
			currentChannel = currentChannel.parent;
		}
		return "/" + path.join("/");
	}
};


module.exports = Client;
