var React = require("react");

function fillZero(number, len) {
	number = "" + number;
	while(number.length < len) {
		number = "0" + number;
	}
	return number;
}

var Line = React.createClass({
	render: function() {
		var time = fillZero(this.props.date.getHours(), 2) + ":" + fillZero(this.props.date.getMinutes(), 2) + ":" + fillZero(this.props.date.getSeconds(), 2);
		console.log("time", time)
		return (
			<tr className={this.props.type}>
				<td>{time}</td>
				<td>{this.props.origin}</td>
				<td>{this.props.message}</td>
			</tr>
		);
	}
});

module.exports = Line;
