var React = require("react");
var User = require("./user");

var Channel = React.createClass({
	render: function() {
		var currentChannel = this.props.channel;
		var users = currentChannel.users.map(function(user) {
			return <User user={user} key={user.session}/>;
		});
		var subChannels = currentChannel.children.map(function(channel) {
			return <Channel channel={channel} key={channel.id}/>;
		});
		return (
			<li className="channel">
				<div className="name">{currentChannel.name}</div>
				<div className="users">
					<ul>{users}</ul>
				</div>
				<div className="channels">
					<ul>{subChannels}</ul>
				</div>
			</li>
		);
	}
});

module.exports = Channel;
