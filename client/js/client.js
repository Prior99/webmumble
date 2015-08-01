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
			this.channels = channels;
			this.user = this.findUser(this.serverInfo.username);
			
			var html = this.buildChannelHTML(this.channels);
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
			console.log("Joined Channel: " + channel);
			path = channel.split("/");
			while(path[0] === ""){
				path.shift();
			}
			if(path[0] !== this.channels.name){
				throw new Error("Channel does not exist: " + channel);
			}
			var currentChannel = this.channels;
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
					throw new Error("Channel does not exist: " + channel);
				}
			}
			var userElem = this.user.user.html.detach();
			currentChannel.userList.append(userElem);
		}
	},
	
	findUser: function(username){
		var channelsToProcess = [this.channels];
		var channel;
		while(channelsToProcess.length !== 0){
			channel = channelsToProcess.shift();
			for(var i = 0; i < channel.users.length; i++){
				if(channel.users[i].name === username){
					return {
						channel: channel,
						user: channel.users[i]
					};
				}
			}
			for(var i = 0; i < channel.children.length; i++){
				channelsToProcess.push(channel.children[i]);
			}
		}
		return undefined;
	},
	buildChannelHTML: function(channel, path){
		if(path === undefined){
			path = "";
		}
		path += "/" + channel.name;
		
		var html = $("<li></li>", {
			id: path,
			"class": "channel",
			text: channel.name
		});
		
		var userList = $("<ul></ul>");
		for(var i = 0; i < channel.users.length; i++){
			var user = $("<li></li>", {
				id: channel.users[i].name,
				"class": "user",
				text: channel.users[i].name
			});
			channel.users[i].html = user;
			user.appendTo(userList);
		}
		channel.userList = userList;
		userList.appendTo(html);
		
		var subChannelList = $("<ul><ul>");
		for(var i = 0; i < channel.children.length; i++){
			this.buildChannelHTML(channel.children[i], path).appendTo(subChannelList);
		}
		channel.channelList = subChannelList;
		subChannelList.appendTo(html);
		
		channel.html = html;
		return html;
	}
};