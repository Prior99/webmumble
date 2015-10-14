var Bumble = require("./bumble");
var UI = require("./ui");

window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = (navigator.getUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.webkitGetUserMedia);

window.ui = new UI();

$(function(){
	window.bumble = new Bumble({
		sampleRate : 48000,
		bufferSize : 1024,
		websocketUrl : "ws://localhost:8080"
	});

	window.bumble.on('error', function(err) {
		console.error(err);
	});

	$("#submit").click(function() {
		window.bumble.joinServer($("#server").val(),
			$("#port").val(),
			$("#username").val(),
			$("#password").val());
	})

	window.bumble.start();
});
