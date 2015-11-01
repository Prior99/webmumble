var React = require("react");
var Channel = require("./channel");

var ChannelTree = React.createClass({
	handleChannelJoin : function(channel) {
		this.props.onChannelJoin(channel);
	},
	render: function() {
		if(this.props.channels) {
			return <ul className="channeltree"> <Channel channel={this.props.channels} onJoin={this.handleChannelJoin}/> </ul>;
		}
		else {
			return <ul className="channeltree"></ul>
		}
	}
});

module.exports = ChannelTree;
