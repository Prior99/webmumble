var Client = function(socket, channelView, messageView){
	this.views = {
		channel: channelView,
		message: messageView
	};
	this.socket = socket;
	
	this.socket.on("mumble-error", this.eventHandler.onError.bind(this));
	this.socket.on("joinedServer", this.eventHandler.onServerJoined.bind(this));
	this.socket.on("channelJoined", this.eventHandler.onChannelJoined.bind(this));
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
		onServerJoined: function(channels){
			this.channelTree = new ChannelTree(channels);
			this.user = this.findUser(this.serverInfo.username);
			
			var html = this.channelTree.buildChannelHTML();
			this.views.channel.html("");
			this.views.channel.append(html);
			
			$(".channel").click(function(event){
				this.joinChannel(event.toElement.id);
				return false;
			}.bind(this));
			$(".user").click(function(event){
				console.log("Clicked User: " + event.toElement.id);
				return false;
			}.bind(this));
		},
		onChannelJoined: function(channel){
			//console.log("Joined Channel: " + channel);
			var userElem = this.user.user.html.detach();
			this.findChannelByPath(channel).userList.append(userElem);
		}
	}
};