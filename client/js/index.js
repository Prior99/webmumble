var Bumble = require("./bumble");
var ConnectUI = require("./ui/connectui");
var MainUI = require("./ui/mainui");

window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = (navigator.getUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.webkitGetUserMedia);


$(function(){
	var container = $("#container")[0];
	var ui = new ConnectUI(container);
	var bumble = new Bumble({
		sampleRate : 48000,
		bufferSize : 1024,
		websocketUrl : "ws://localhost:8080"
	});

	ui.on('connect', function(args) {
		ui.displayJoiningServerPage();
		bumble.joinServer(args.server, args.port, args.username, args.password);
	});


	bumble.on('error', function(err) {
		console.error(err);
	});

	bumble.on('audio-acquired', function() {
		ui.displayConnectingPage();
	});

	bumble.on('server-joined', function() {
		ui = new MainUI(container);
	});

	bumble.on('connected', function() {
		ui.displayConnectPage();
	});

	ui.displayAudioAcquirationPage();

	bumble.start();
	window.bumble = bumble;
});
