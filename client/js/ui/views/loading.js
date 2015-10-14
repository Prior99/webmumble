var React = require("react");

var ConnectForm = React.createClass({
	handleConnect : function(e) {
		e.preventDefault();
		this.props.onConnect({
			server : this.refs.servername.value.trim(),
			username : this.refs.username.value.trim(),
			password : this.refs.password.value.trim(),
			port : this.refs.port.value.trim(),
		});
	},
	render: function() {
		return (
			<div className="vertical-center">
				<div className="loading">
					<div className="icon">
						<i className="fa fa-spin fa-cog"></i>
					</div>
					<div className="description">
						{this.props.description}
					</div>
				</div>
			</div>
		);
	}
});

module.exports = ConnectForm;
