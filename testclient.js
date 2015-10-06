/*
 * Includes
 */

/*
 * Polyfills
 */

window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = (navigator.getUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.webkitGetUserMedia);
/*
 * Code
 */

//Connect to server
var ws = new WebSocket('ws://localhost:8081');
ws.binaryType = "arraybuffer";
ws.onopen = function() {
	//Get Usermedia
	navigator.getUserMedia({ audio: true }, mediaAcquired, mediaError);
};



function mediaAcquired(stream){
	/*
	 * Microphone -> WebsocketSinkNode -> Server
	 */
	var context = new AudioContext();
	var input = context.createMediaStreamSource(stream);
	window.input = input; //Make sure garbage collector doesn't kill us.
	var webSocketSinkNode = context.createScriptProcessor(0, 1, 1);
	webSocketSinkNode.onaudioprocess = function(e) {
		ws.send(e.inputBuffer.getChannelData(0));
	};
	input.connect(webSocketSinkNode);
	/*
	 * Server -> WebsocketSourceNode -> Speaker
	 */
	var incoming = [];
	var bufferSize = 8192;
	var webSocketSourceNode = context.createScriptProcessor(bufferSize, 1, 1);
	var voiceWasEnded = true;
	ws.onmessage = function(message) {
		var data = new Float32Array(message.data);
		if(data.length != bufferSize) {
			for(var i = 0; i < data.length; i += bufferSize) {
				incoming.push(data.slice(i, i + bufferSize));
			}
		}
		else {
			incoming.push(data);
		}
		if(voiceWasEnded && incoming.length > 3) {
			voiceWasEnded = false;
		}
		console.log(data.length / bufferSize, "buffers written. Modulo", data.length % bufferSize, "Now ", incoming.length, "in queue");
	};
	webSocketSourceNode.onaudioprocess = function(e) {
		if(incoming.length && !voiceWasEnded) {
			var data = incoming.shift();
			e.outputBuffer.getChannelData(0).set(data);
		}
		else {
			voiceWasEnded = true;
		}
		console.log("Took elem from queue. Now" , incoming.length, "elements in queue");
	};
	webSocketSourceNode.connect(context.destination);

}

function mediaError(err) {
	console.error(err);
}
