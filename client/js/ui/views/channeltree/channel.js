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
		var subUsers = this.props.channel.users.map(function(user) {
			return <User user={user} key={user.session}/>;
		}.bind(this));
		var subChannels = this.props.channel.children.sort(function(a, b) {
			return a.position - b.position
		}).map(function(channel) {
			return <Channel channel={channel} key={channel.id} onJoin={this.bubbleUpJoin}/>;
		}.bind(this));
		return (
			<li className="channel">
				<div className="info">
					<div className="name">{this.props.channel.name}</div>
					<div className="buttons">
						<button className="btn btn-xs" onClick={this.handleJoin}><i className="fa fa-sign-in"></i></button>
					</div>
				</div>
				<div className="users">
					<ul>{subUsers}</ul>
				</div>
				<div className="channels">
					<ul>{subChannels}</ul>
				</div>
			</li>
		);
	}
});

module.exports = Channel;
