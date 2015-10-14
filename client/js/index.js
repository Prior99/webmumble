var Bumble = require("./bumble");
var UI = require("./ui");

window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = (navigator.getUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.webkitGetUserMedia);


$(function(){
	var ui = new UI($("#container")[0]);
	var bumble = new Bumble({
		sampleRate : 48000,
		bufferSize : 1024,
		websocketUrl : "ws://localhost:8080"
	});

	ui.on('connect', function(args) {
		bumble.joinServer(args.server, args.port, args.username, args.password);
	});


	bumble.on('error', function(err) {
		console.error(err);
	});

	bumble.on('audio-acquired', function() {
		ui.displayConnectingPage();
	});

	bumble.on('connected', function() {
		ui.displayConnectPage();
	});
	ui.displayAudioAcquirationPage();

	bumble.start();
	window.bumble = bumble;
	window.ui = ui;
});
