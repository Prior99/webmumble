var ReactDOM = require("react-dom");
var React = require("react");
var Connect = require("./views/connect");
var Loading = require("./views/loading");
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
//var ChatLog = require("./views/chatlog");
var ChannelTreeComponent = require("./views/channeltree");
var ChannelTree = require("../../../shared/channelTree");
//var ChatInput = require("./views/chatinput");
var LogComponent = require("./views/log");

var MainUI = function(container) {
	var uiThis = this;
	this.logList = [];
	this.container = container;
	this.componentClass = React.createClass({
		getInitialState : function() {
			return {
				channels : null,
				log : uiThis.logList
			};
		},
		render : function() {
			return (
				<div className="row">
					<div className="col-md-6">
						<h2>Channel Tree</h2>
						<ChannelTreeComponent channels={this.state.channels} onChannelJoin={uiThis.onChannelJoin.bind(uiThis)}/>
					</div>
					<div className="col-md-6">
						<h2>Log</h2>
						<LogComponent log={this.state.log}/>
					</div>
				</div>
			);
		}
	});
	this.component = ReactDOM.render(<this.componentClass />, this.container);
};

Util.inherits(MainUI, EventEmitter);

MainUI.prototype.onChannelJoin = function(channel) {
	this.emit("join-channel", channel);
};

MainUI.prototype.log = function(message) {
	message.id = this.logList.length;
	if(!message.date) {
		message.date = new Date();
	}
	if(!message.origin) {
		message.origin = "Server";
	}
	this.logList.push(message);
	this.component.setState({
		log : this.logList
	});
};

MainUI.prototype.moveUser = function(userSession, oldChannel, newChannel) {
	var update = function() {
		this.component.setState({
			channels : this.channels.rootChannel
		});
	}.bind(this);
	var attachUser = function(user) {
		this.channels.findChannelById(newChannel, function(channel, parent) {
			if(channel) {
				channel.users.push(user);
				update();
			}
		}.bind(this));
	}.bind(this);
	var detachUser = function() {
		this.channels.findUserBySession(userSession, function(foundUser, channel) {
			if(foundUser && channel) {
				channel.users = channel.users.filter(function(user) {
					return userSession !== foundUser.session;
				});
				attachUser(foundUser);
			}
		}.bind(this));
	}.bind(this);
	detachUser();
};

MainUI.prototype.setChannels = function(channels) {
	this.channels = new ChannelTree(channels);
	this.component.setState({
		channels : this.channels.rootChannel
	});
};

module.exports = MainUI;
