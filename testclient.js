var Bumble = require('./bumble');

window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = (navigator.getUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.webkitGetUserMedia);

window.bumble = new Bumble({
	sampleRate : 48000,
	bufferSize : 1024,
	websocketUrl : "ws://localhost:8081"
});

window.bumble.on('error', function(err) {
	console.error(err);
});

window.bumble.start();
