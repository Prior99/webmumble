var User = function(args){
	this.name = args.name;
	
	this.html = $("<li></li>", {
		id: this.name,
		"class": "user",
		text: this.name
	});
};

User.prototype = {
	
};

module.exports = User;