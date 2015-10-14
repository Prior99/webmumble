var React = require("react");
var User = require("./user");

var Channel = React.createClass({
	bubbleUpJoin : function(channel) {
		this.props.onJoin(channel);
	},
	handleJoin : function(e) {
		this.props.onJoin(this.props.channel);
	},
	render: function() {
		var currentChannel = this.props.channel;
		var users = currentChannel.users.map(function(user) {
			return <User user={user} key={user.session}/>;
		}.bind(this));
		var subChannels = currentChannel.children.sort(function(a, b) {
			return a.position - b.position
		}).map(function(channel) {
			return <Channel channel={channel} key={channel.id} onJoin={this.bubbleUpJoin}/>;
		}.bind(this));
		return (
			<li className="channel">
				<div className="info">
					<div className="name">{currentChannel.name}</div>
					<div className="buttons">
						<button className="btn btn-xs" onClick={this.handleJoin}><i className="fa fa-sign-in"></i></button>
					</div>
				</div>
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
