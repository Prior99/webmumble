var ReactDOM = require("react-dom");
var React = require("react");
var Connect = require("./views/connect");
var Loading = require("./views/loading");
var Util = require('util');
var EventEmitter = require('events').EventEmitter;

var MainUI = function(container) {
	this.container = container;
};

Util.inherits(MainUI, EventEmitter);

module.exports = MainUI;
