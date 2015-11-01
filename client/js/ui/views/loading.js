var React = require("react");

var Loading = React.createClass({
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

module.exports = Loading;
