var React = require("react");
var User = require("./user");

var Channel = React.createClass({
	bubbleUpJoin : function(channel) {
		this.props.onJoin(channel);
	},
	handleJoin : function(e) {
		this.props.onJoin(this.props.channel);
	},
	getInitialState : function() {
		return {
			opened : true
		};
	},
	toggleOpened : function(e) {
		this.setState({
			opened : !this.state.opened
		});
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
		var openedClass, iconClass;
		if(this.state.opened) {
			openedClass = "channel opened";
			iconClass = "indicator fa fa-chevron-circle-down";
		}
		else {
			openedClass = "channel closed";
			iconClass = "indicator fa fa-chevron-circle-right";
		}
		return (
			<li className={openedClass}>
				<div className="info row" onClick={this.toggleOpened}>
					<div className="name col-md-8">
						<i className={iconClass}></i>
						<i className="icon fa fa-folder-open"></i> 
						{this.props.channel.name}
					</div>
					<div className="buttons col-md-4">
						<button className="btn btn-xs btn-default" onClick={this.handleJoin}><i className="fa fa-sign-in"></i></button>
					</div>
				</div>
				<div className="users">
					<ul>{subUsers}</ul>
				</div>
				<div className="channels">
					<ul className="channeltree">{subChannels}</ul>
				</div>
			</li>
		);
	}
});

module.exports = Channel;
