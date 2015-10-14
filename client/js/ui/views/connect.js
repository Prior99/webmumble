var React = require("react");

var ConnectForm = React.createClass({
	render: function() {
		return (
			<div className="vertical-center">
			<form className="form-signin">
				<h2 className="form-signin-heading">Connect</h2>
				<div className="form-group">
					<div className="input-group">
						<span className="input-group-addon" id="basic-addon1"><i className="fa fa-server"></i></span>
						<input
							name="servername"
							maxlength="20"
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
							name="port"
							maxlength="20"
							type="text"
							className="form-control"
							value="64738"
							required />
					</div>
				</div>
				<div className="form-group">
					<div className="input-group">
						<span className="input-group-addon" id="basic-addon1"><i className="fa fa-user"></i></span>
						<input
							name="username"
							maxlength="20"
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
							name="password"
							maxlength="20"
							type="password"
							className="form-control"
							placeholder="Password (Optional)"
							required />
					</div>
				</div>
				<button type="submit" className="btn btn-success btn-block"><i className="fa fa-power-off"></i> Connect</button>
			</form>
			</div>
		);
	}
});

module.exports = ConnectForm;
