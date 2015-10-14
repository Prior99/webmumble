var ReactDOM = require("react-dom");
var React = require("react");
var Connect = require("./views/connect");
var Loading = require("./views/loading");
var Util = require('util');
var EventEmitter = require('events').EventEmitter;

var UI = function(container) {
	this.container = container;
};

Util.inherits(UI, EventEmitter);

UI.prototype.displayConnectPage = function() {
	ReactDOM.render(<Connect onConnect={this.onConnect}/>, this.container);
};

UI.prototype.onConnect = function(e) {
	this.emit('connect', e);
};

UI.prototype.displayAudioAcquirationPage = function() {
	ReactDOM.render(<Loading description="Waiting for Audiocontext..."/>, this.container);
};

UI.prototype.displayConnectingPage = function() {
	ReactDOM.render(<Loading description="Connecting to server..."/>, this.container);
};

module.exports = UI;
