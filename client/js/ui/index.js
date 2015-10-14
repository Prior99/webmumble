var ReactDOM = require("react-dom");
var React = require("react");
var Connect = require("./views/connect");

var UI = function() {
	ReactDOM.render(<Connect name="John" />, $("#container")[0]);
};

module.exports = UI;
