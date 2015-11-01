var EventEmitter = require('events').EventEmitter;
var Util = require('util');

var Protocol = function(stream) {
	this.stream = stream;
	this.packetId = 0;
	this.answers = {};
	this.stream.on('data', this.onData.bind(this));
};

Util.inherits(Protocol, EventEmitter);

Protocol.prototype.onData = function(data) {
	console.log("received", data);
	var type = data.type;
	if(type == "event") {
		this.onEvent(data);
	}
	else if(type == "answer") {
		this.onAnswer(data);
	}
};

Protocol.prototype.onAnswer = function(data) {
	var answer;
	if(answer = this.answers[data.id]) {
		answer(data.data);
		this.answers[data.id] = undefined;
	}
};

Protocol.prototype.onEvent = function(data) {
	var event = data.event;
	var dat = data.data;
	var done = function(answer) {
		var obj = {
			id : data.id,
			type : "answer",
			data : answer
		};
		this.stream.write(obj);
	}.bind(this);
	this.emit(event, dat, done);
};

Protocol.prototype.send = function(event, data, done) {
	var obj = {
		id : this.packetId,
		type : "event",
		event : event,
		data : data
	};
	if(done) {
		this.answers[this.packetId] = done;
	}
	this.stream.write(obj);
	console.log("send", obj);
	this.packetId++;
};

module.exports = Protocol;
