var ChannelTree = require("./channelTree");
var User = require("./user");
var Channel = require("./channel");


function hasGetUserMedia() {
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  return !!navigator.getUserMedia;
}

var Client = function(sockets, htmlElements, ready){
	this.views = {
		channel: htmlElements.channels,
		message: htmlElements.messages
	};
	this.audio = {
		output: htmlElements.audioOut,
		input: htmlElements.audioIn
	};
	this.socket = sockets.messages;
	this.audioSocket = sockets.audio;
	
	this.ready = [ready];
	this.socket.emit("requestTag");
	
	this.socket.on("mumble-error", this.eventHandler.onError.bind(this));
	this.socket.on("joinedServer", this.eventHandler.onServerJoined.bind(this));
	this.socket.on("tag", this.eventHandler.onTag.bind(this));
	
	this.initMumbleEvents();
	// this.socket.on("channelJoined", this.eventHandler.onChannelJoined.bind(this));
};

Client.prototype = {
	joinServer: function(server, port, username){	
		this.serverInfo = {
			server: server,
			port: port,
			username: username,
		};
		this.socket.emit("joinServer", this.serverInfo);
	},
	joinChannel: function(path){
		this.socket.emit("joinChannel", path);
	},
	
	eventHandler: {
		onError: function(error){
			console.log(error);
		},
		onTag: function(tag){
			this.tag = tag;
			this.audioSocket.emit("showTag", this.tag);
			if(this.ready !== undefined){
				for(var handler in this.ready){
					this.ready[handler]();
				}
				this.ready = undefined;
			}
		},
		onServerJoined: function(args){
			var startAudio = function(){
				this.audio.output.src = "http://" + window.location.host+ "/audio/" + this.tag;
				this.audio.output.play();
				
				if(hasGetUserMedia()){
					navigator.getUserMedia({
						audio: true
					}, function(stream){
						this.audio.context = new AudioContext();
						this.audio.input = this.audio.context.createMediaStreamSource(stream);
						console.log(this.audio.context);
						console.log(this.audio.input);
						
						var streamer = this.audio.context.createScriptProcessor(0, 1, 1);
						streamer.onaudioprocess = function(event){
							this.audioSocket.emit("record", event.inputBuffer.getChannelData(0));
						}.bind(this);
						
						this.audio.input.connect(streamer);
						streamer.connect(this.audio.context.destination);
						
						stream.onactive = function() {
							console.log("aktive");
						}.bind(this);
						stream.oninactive = function(){
							console.log("inactive");
						}
					}.bind(this), function(err){
						throw err;
					});
				}
			}.bind(this);
			if(this.tag !== undefined){
				startAudio();
			}
			else{
				this.ready.push(startAudio);
			}
			
			this.channelTree = new ChannelTree(new Channel(args.channels));
			
			var html = this.channelTree.rootChannel.html;
			this.views.channel.html("");
			this.views.channel.append(html);
			
			this.channelTree.findUser(this.serverInfo.username, function(user,channel){
				this.user = {
					user: user,
					channel: channel
				};
			}.bind(this));
			
			$(".channel").click(function(event){
				this.joinChannel(event.toElement.id);
				return false;
			}.bind(this));
			$(".user").click(function(event){
				console.log("Clicked User: " + event.toElement.id);
				return false;
			}.bind(this));
		},
		// onChannelJoined: function(channel){
			// console.log("Joined Channel: " + channel);
			// this.channelTree.moveUser(this.serverInfo.username, channel);
		// },
		onUserConnect: function(user){
			console.log("User " + user.name + " joined");
			this.channelTree.rootChannel.addUser(new User(user));
		},
		onUserMove: function(args){
			console.log(args);
			console.log("User " + args.user + " moved from " + args.oldChannel + " to " + args.newChannel);
			this.channelTree.moveUser(args.user, args.newChannel);
		},
		onUserDisconnect: function(user){
			console.log("User " + user + " disconnected");
			this.channelTree.findUser(user, function(user, channel){
				console.log("\t User found");
				channel.removeUser(user);
			});
		}
	},
	
	initMumbleEvents: function(){
		this.socket.on("user-connect", this.eventHandler.onUserConnect.bind(this));
		this.socket.on("user-move", this.eventHandler.onUserMove.bind(this));
		this.socket.on("user-disconnect", this.eventHandler.onUserDisconnect.bind(this));
	}
};

module.exports = Client;