var React = require("react");
var Line = require("./line");

var Log = React.createClass({
	render: function() {
		var lines = this.props.log.map(function(line) {
			var type = line.type ? line.type : "";
			return <Line id={line.id} key={line.id} origin={line.origin} message={line.message} date={line.date} type={type}/>;
		});
		console.log(lines);
		return (
		<table className="table table-condensed table-striped">
			<tbody>
			{lines}
			</tbody>
		</table>);
	}
});

module.exports = Log;
