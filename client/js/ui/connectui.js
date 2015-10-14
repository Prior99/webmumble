var ReactDOM = require("react-dom");
var React = require("react");
var Connect = require("./views/connect");
var Loading = require("./views/loading");
var Util = require('util');
var EventEmitter = require('events').EventEmitter;

var ConnectUI = function(container) {
	this.container = container;
};

Util.inherits(ConnectUI, EventEmitter);

ConnectUI.prototype.displayConnectPage = function() {
	ReactDOM.render(<Connect onConnect={this.onConnect.bind(this)}/>, this.container);
};

ConnectUI.prototype.onConnect = function(e) {
	this.emit('connect', e);
};

ConnectUI.prototype.displayAudioAcquirationPage = function() {
	ReactDOM.render(<Loading description="Waiting for Audiocontext..."/>, this.container);
};

ConnectUI.prototype.displayConnectingPage = function() {
	ReactDOM.render(<Loading description="Connecting to Bumble server..."/>, this.container);
};

ConnectUI.prototype.displayJoiningServerPage = function() {
	ReactDOM.render(<Loading description="Waiting for Bumble to connect to Mumble..."/>, this.container);
};

module.exports = ConnectUI;
