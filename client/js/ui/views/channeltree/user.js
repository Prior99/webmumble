var React = require("react");

var User = React.createClass({
	render: function() {
		return (
			<li className="user"><i className="icon fa fa-user"></i> {this.props.user.name}</li>
		);
	}
});

module.exports = User;
