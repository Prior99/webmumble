var ReactDOM = require("react-dom");
var React = require("react");
var Connect = require("./views/connect");
var Loading = require("./views/loading");
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
//var ChatLog = require("./views/chatlog");
var ChannelTree = require("./views/channeltree");
//var ChatInput = require("./views/chatinput");

var MainUI = function(container) {
	this.container = container;
};

Util.inherits(MainUI, EventEmitter);

MainUI.prototype.start = function(channels) {
	this.channels = channels;
	this.component = React.createClass({
		render : function() {
			return (
				<ChannelTree channels={channels} />
			);
		}
	});
	ReactDOM.render(<this.component />, this.container);
};

module.exports = MainUI;
