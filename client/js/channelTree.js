var ChannelTree = require("../../shared/channelTree");
var User = require("./user");
var Channel = require("./channel");

ChannelTree.prototype.moveUser = function(username, newChannel){
	this.findUser(username, function(user, channel){
		if(user !== undefined){
			channel.removeUser(user);
			if(typeof newChannel === "string" || newChannel instanceof String){
				newChannel = this.findChannelByPath(newChannel);
			}
			newChannel.addUser(user);
		}
		else{
			throw new Error("User " + username + " not found");
		}
	}.bind(this));
};

module.exports = ChannelTree;