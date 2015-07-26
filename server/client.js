var Mumble = require("mumble");

var Client = function(socket){
	this.socket = socket;
	this.socket.on("joinServer", this.connect.bind(this));
}

Client.prototype = {
	connect: function(args){
		console.log("Connecting to: "  + args.server + ":" + args.port + " as " + args.username);
		Mumble.connect("mumble://" + args.server + ":" + args.port, {}, function(error, connection){
			if(!error){
				this.mumble = connection;
				connection.on("initialized", this.onInit.bind(this));
				connection.on("voice", this.onVoice.bind(this));
				try{
					connection.authenticate(args.username, "");
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
		this.socket.emit("joinedServer", this.retreiveChannels());
	},

	onVoice: function(event){

	},

	retreiveChannels: function(){
		var channelList = {children:[]};
		var channelsToProcess = [{channel: this.mumble.rootChannel, parent: channelList}];
		var channel, parent;
		while(channelsToProcess.length !== 0){
			channel = channelsToProcess.shift();
			parent = channel.parent;
			channel = channel.channel;

			var users = []
			for(var i = 0; i < channel.users.length; i++){
				users.push(channel.users[i].name);
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
		console.log(channelList);
		return channelList;
	}
};


module.exports = Client;
