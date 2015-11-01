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
			<form className="form-signin well" onSubmit={this.handleConnect}>
				<h2 className="form-signin-heading">Connect</h2>
				<div className="form-group">
					<div className="input-group">
						<span className="input-group-addon" id="basic-addon1"><i className="fa fa-server"></i></span>
						<input
							ref="servername"
							type="text"
							className="form-control"
							placeholder="example.org"
							required />
					</div>
				</div>
				<div className="form-group">
					<div className="input-group">
						<span className="input-group-addon" id="basic-addon1"><i className="fa fa-plug"></i></span>
						<input
							ref="port"
							defaultValue="64738"
							type="text"
							className="form-control"
							required />
					</div>
				</div>
				<div className="form-group">
					<div className="input-group">
						<span className="input-group-addon" id="basic-addon1"><i className="fa fa-user"></i></span>
						<input
							ref="username"
							type="text"
							className="form-control"
							placeholder="Username"
							required />
					</div>
				</div>
				<div className="form-group">
					<div className="input-group">
						<span className="input-group-addon" id="basic-addon1"><i className="fa fa-unlock-alt"></i></span>
						<input
							ref="password"
							type="password"
							className="form-control"
							placeholder="Password (Optional)" />
					</div>
				</div>
				<button
					type="submit"
					className="btn btn-success btn-block">
					<i className="fa fa-power-off"></i> Connect
				</button>
			</form>
			</div>
		);
	}
});

module.exports = ConnectForm;
