var React = require("react");
var Channel = require("./channel");

var ChannelTree = React.createClass({
	render: function() {
		return (
			<ul>
				<Channel channel={this.props.channels} />
			</ul>
		);
	}
});

module.exports = ChannelTree;
