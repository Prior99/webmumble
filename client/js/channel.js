var User = require("./user");

var Channel = function(args, path){
	this.name = args.name;
	this.children = args.children;
	this.users = args.users;
	
	this.generateHTML(path);
};

Channel.prototype = {
	addUser: function(user){
		this.users.push(user);
		this.userList.append(user.html);
	},
	removeUser: function(user){
		for(var i = 0; i < this.users.length; i++){
			if(this.users[i].name === user.name){
				this.users = this.users.splice(i, 1);
				break;
			}
		}
		user.html.detach();
	},
	generateHTML: function(path){
		if(path === undefined){
			path = "";
		}
		path += "/" + this.name;
		
		this.html = $("<li></li>", {
			id: path,
			"class": "channel",
			text: this.name
		});
		
		this.userList = $("<ul><ul>");
		for(var i = 0; i < this.users.length; i++){
			this.users[i] = new User(this.users[i]);
			this.userList.append(this.users[i].html);
		}
		this.html.append(this.userList);
		
		this.channelList = $("<ul></ul>");
		for(var i = 0; i < this.children.length; i++){
			this.children[i] = new Channel(this.children[i], path);
			this.channelList.append(this.children[i].html);
		}
		this.html.append(this.channelList);
	}
}

module.exports = Channel;