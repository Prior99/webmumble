var WS = require('websocket-stream');

var ws = WS('ws://localhost:8081')

ws.on('data', function(chunk) {
	console.log(chunk);
});
//ws.write(new ArrayBuffer(1024));
window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.mediaDevices = navigator.mediaDevices || ((navigator.mozGetUserMedia || navigator.webkitGetUserMedia) ? {
	getUserMedia: function(c) {
		return new Promise(function(y, n) {
			(navigator.mozGetUserMedia || navigator.webkitGetUserMedia).call(navigator, c, y, n);
		});
	}
} : null);

var elem = $("#test");
var p = navigator.mediaDevices.getUserMedia({
	audio: true
});
p.then(function(stream){
	console.log("test");
	//var audio = new AudioContext();
	//audio.input = this.audio.context.createMediaStreamSource(stream);
	//elem[0].src = window.URL.createObjectURL(stream);
	//console.log("toast");
	console.log(stream);
	console.log(stream.getAudioTracks());
	//stream.pipe(ws);
	var context = new AudioContext();
	var input = context.createMediaStreamSource(stream);
	var node = (context.createScriptProcessor || context.createJavaScriptNode).call(context, 512, 1, 1);
	node.onaudioprocess = function(e) {
		console.log(e.inputBuffer);
		ws.write(e.inputBuffer.getChannelData(0));
	};
	input.connect(node);
	console.log("test2");
}.bind(this));
p.catch(function(e) {
	throw e;
});
