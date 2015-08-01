var Client = function(socket, channelView, messageView){
	this.views = {
		channel: channelView,
		message: messageView
	};
	
	socket.on("mumble-error", this.eventHandler.onError.bind(this));
	socket.on("joinedServer", this.eventHandler.onServerJoined.bind(this));
	socket.on("joinedChannel", this.eventHandler.onChannelJoined.bind(this));
};

Client.prototype = {
	joinServer: function(server, port, username){	
		this.serverInfo = {
			server: server,
			port: port,
			username: username,
		};
		socket.emit("joinServer", this.serverInfo);
	},
	joinChannel: function(path){
		socket.emit("joinChannel", path);
	},
	
	eventHandler: {
		onError: function(error){
			console.log(error);
		},
		onServerJoined: function(channels){
			this.channels = channels;
			this.currentChannel = this.findUser(this.serverInfo.username);
			
			var html = this.buildChannelHTML(this.channels);
			this.views.channel.html(html);
			
			$(".channel").click(function(event){
				this.joinChannel(this.id);
				return false;
			});
		},
		onChannelJoined: function(channel){
			
		}
	},
	
	findUser: function(username){
		var channelsToProcess = [this.channels];
		var channel;
		while(channelsToProcess.length !== 0){
			channel = channelsToProcess.shift();
			if(channel.users.indexOf(username) !== -1){
				return channel;
			}
			else{
				for(var i = 0; i < channel.children.length; i++){
					channelsToProcess.push(channel.children[i]);
				}
			}
		}
		return undefined;
	},
	buildChannelHTML: function(channel, path){
		if(path === undefined){
			path = "";
		}
		path += "/" + channel.name;
		
		var html = "<li class=\"channel\" + id=\"" + path + "\">" + channel.name + "<ul>";
		for(var i = 0; i < channel.users.length; i++){
			html += "<li class=\"user\" id=\"" + channel.users[i] + "\">" + channel.users[i] + "</li>";
		}
		for(var i = 0; i < channel.children.length; i++){
			html += buildChannelHTML(channel.children[i], path);
		}
		html += "</ul></li>"
		return html;
	}
};