var Bumble = require("./bumble");
var ConnectUI = require("./ui/connectui");
var MainUI = require("./ui/mainui");

window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = (navigator.getUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.webkitGetUserMedia);

$.urlParam = function(name){
	var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
	if(results) {
		return results[1];
	}
};

$(function(){
	var container = $("#container")[0];
	var ui = new ConnectUI(container);
	var bumble = new Bumble({
		sampleRate : 48000,
		bufferSize : 1024,
		websocketUrl : "ws://localhost:8080"
	});

	function connect(args) {
		ui.displayJoiningServerPage();
		bumble.joinServer(args.server, args.port, args.username, args.password);
	}

	ui.on('connect', connect);

	bumble.on('error', function(err) {
		console.error(err);
	});

	bumble.on('audio-acquired', function() {
		ui.displayConnectingPage();
	});

	bumble.on('server-joined', function() {
		ui = new MainUI(container);
	});

	bumble.on('channels', function(channels) {
		console.log(ui);
		ui.start(channels);
	});

	bumble.on('ready', function() {
		if($.urlParam("server") && $.urlParam("username")) {
			connect({
				server : $.urlParam("server"),
				username : $.urlParam("username"),
				password : $.urlParam("password"),
				port : $.urlParam("port") || 64738
			});
		}
		else {
			ui.displayConnectPage();
		}
	});

	ui.displayAudioAcquirationPage();

	bumble.start();
	window.bumble = bumble;
});
