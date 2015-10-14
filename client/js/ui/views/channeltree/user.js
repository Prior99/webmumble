var React = require("react");

var User = React.createClass({
	render: function() {
		return (
			<li className="user">{this.props.user.name}</li>
		);
	}
});

module.exports = User;
