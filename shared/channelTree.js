var ChannelTree = function(tree){
	this.rootChannel = tree;
}

ChannelTree.prototype = {
	/**
	 * Traveres all channels from root down. If no root is given, the channel tree of with which the object was constructed is used.
	 *
	 * Root can be any object with the attributes "name" and "children" (array of objects with the same attributes).
	 * 
	 * 	@param
	 *		todo: is invoked on every channel
	 *			@param
	 *				channel: the current channel object
	 *				parent: parent of the current channel
	 *			@return
	 * 				true - when traversing can be stopped (e.g. element is found)
	 * 				false - when traversing should continue
	 *		root: the root channel, which should be used for traversing
	 * 	@return
	 *		true - when traversing was stopped by a todo
	 *		false - when traversing finishes uninterrupted
	 */
	traverseChannels: function(todo, root){
		var channelsToProcess = [{
			channel: root === undefined? this.rootChannel: root
		}];
		while(channelsToProcess.length !== 0){
			var channelInfo = channelsToProcess.shift();
			var channel = channelInfo.channel;
			if(todo(channel, channelInfo.parent)){
				return true;
			}
			
			if(channel.children !== undefined && channel.children.length !== 0){
				for(var i = 0; i < channel.children.length; i++){
					channelsToProcess.push({
						channel: channel.children[i],
						parent: channel
					});
				}
			}
		}
		return false;
	},
	
	/**
	 * Traveres all users below the channel "root". If no root is given, the channel tree of with which the object was constructed is used.
	 *
	 * Root can be any object with the attributes "name", "children" (array of objects with the same attributes) and users (array of objects).
	 * 
	 * 	@param
	 *		todo: is invoked on every user
	 *			@param
	 *				user: the current user object
	 *				channel: channel of the user
	 *			@return
	 * 				true - when traversing can be stopped (e.g. element is found)
	 * 				false - when traversing should continue
	 *		root: the root channel, which should be used for traversing
	 * 	@return
	 *		true - when traversing was stopped by a todo
	 *		false - when traversing finishes uninterrupted
	 */
	traverseUsers: function(todo, root){
		return this.traverseChannels(function(channel){
			for(var i = 0; i < channel.users.length; i++){
				if(todo(channel.users[i], channel)){
					return true;
				}
			}
			return false;
		}, root);
	},
	
	/**
	 * Finds the user specified by username and invokes the callback when it is found. When the user is not found it will call the callback with undefined as both parameters.
	 * 	@param
	 *		username: name of the user
	 *		todo: callback to invoke
	 *			@param
	 *				user: user object for the given username or undefined it the user was not found
	 *				channel: channel of the user or undefined if the user was not found
	 *			@return
	 *				undefined
	 *	@return
	 *		undefined
	 */
	findUser: function(username, todo){
		var found = this.traverseUsers(function(user, channel){
			if(user.name === username){
				todo(user, channel);
				return true;
			}
			return false;
		});
		if(! found){
			todo();
		}
	},
	
	/**
	 * Finds a channel by its path in the hierachy (e.g. /rootChannel/channel/finalChannel). It must always be an absolute path (starting wit "/rootChannel").
	 * 	@param
	 *		channel: the path of the channel (e.g. /rootChannel/channel/finalChannel)
	 *	@return
	 *		channel object for the given path
	 *	@throws
	 *		if the path is invalid/does not exist
	 */
	findChannelByPath: function(channel){
		path = channel.split("/");
		while(path[0] === ""){
			path.shift();
		}
		if(path[0] !== this.rootChannel.name){
			throw new Error("Channel does not exist: " + channel);
		}
		var currentChannel = this.rootChannel;
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
		return currentChannel;
	}
};

module.exports = ChannelTree;