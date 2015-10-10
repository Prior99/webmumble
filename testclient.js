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


navigator.getUserMedia({ audio: true }, mediaAcquired, mediaError);
var ws;

function mediaAcquired(stream) {
	ws = new WebSocket('ws://localhost:8081');
	ws.binaryType = "arraybuffer";
	ws.onopen = function() {
		webSocketOpened(stream);
	};
};

function webSocketOpened(stream){
	var context = new AudioContext();
	/*
	 * Microphone -> WebsocketSinkNode -> Server
	 */
 	var bufferSize = 512;
	var encoder = new Worker("workers/encoder/encoder.js");
	encoder.postMessage({
		command : 'init',
		outputSampleRate : 48000,
		inputSampleRate : context.sampleRate
	});
	encoder.addEventListener('message', function(e) {
		var obj = e.data;
		if(obj.type === 'error') {
			console.error(obj.error);
		}
		else if(obj.type === 'packet') {
			ws.send(obj.packet);
		}
	});
	var input = context.createMediaStreamSource(stream);
	window.input = input; //Make sure garbage collector doesn't kill us.
	var webSocketSinkNode = context.createScriptProcessor(0, 1, 1);
	webSocketSinkNode.onaudioprocess = function(e) {
		encoder.postMessage({
			command : 'encode',
			data : e.inputBuffer.getChannelData(0)
		});
	};
	input.connect(webSocketSinkNode);
	/*
	 * Server -> WebsocketSourceNode -> Speaker
	 */
	var decoder = new Worker("workers/decoder/decoder.js");
	decoder.postMessage({
		command : 'init',
		outputSampleRate : context.sampleRate,
		inputSampleRate : 48000
	});
	var incoming = [];
	var webSocketSourceNode = context.createScriptProcessor(bufferSize, 1, 1);
	var voiceWasEnded = true;
	ws.onmessage = function(message) {
		/*var data = new Float32Array(message.data);
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
		}*/
		decoder.postMessage({
			command : 'decode',
			data : message.data
		});
		//console.log(data.length / bufferSize, "buffers written. Modulo", data.length % bufferSize, "Now ", incoming.length, "in queue");
	};
	webSocketSourceNode.onaudioprocess = function(e) {
		if(incoming.length && !voiceWasEnded) {
			var data = incoming.shift();
			e.outputBuffer.getChannelData(0).set(data);
		}
		else {
			voiceWasEnded = true;
		}
		//console.log("Took elem from queue. Now" , incoming.length, "elements in queue");
	};
	webSocketSourceNode.connect(context.destination);

}

function mediaError(err) {
	console.error(err);
}
