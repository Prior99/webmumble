/*
 * Includes
 */
var WS = require('ws');
var Mumble = require('mumble');
var Sox = require('sox-audio');
var PassThroughStream = require('stream').PassThrough;
var FS = require('fs');
/*
 * Constants
 */
var PORT = 8081;
var IP = "0.0.0.0";
var MUMBLE_URL = "mymun.net"
var MUMBLE_PASSWORD = "atomrofl";
var MUMBLE_USER = "Webmumble_Test";
var MUMBLE_CHANNEL = "The Moon";
/*
 * Code
 */
Mumble.connect(MUMBLE_URL, function(error, connection) {
	connection.authenticate(MUMBLE_USER, MUMBLE_PASSWORD);
	connection.on('ready', function() {
		mumbleUp(connection);
	});
});

function mumbleUp(connection) {
	connection.channelByName(MUMBLE_CHANNEL).join();

	var wss = new WS.Server({
		port : PORT
	});
	wss.on('connection', handle)
	console.log("Server running at http://" + IP + ":" + PORT + "/");

	var mumbleInputStream = connection.inputStream();
	var websocketStreamInput = new PassThroughStream();
	var websocketStreamOutput = new PassThroughStream();
	var mumbleOutputStream = new PassThroughStream();
	connection.on("voice", function(data) {
		mumbleOutputStream.write(data);
	});

	function setupBrowserToMumble(ws) {
		var sox = new Sox(websocketStreamInput)
			.inputSampleRate('44.1k')
			.inputBits(32)
			.inputChannels(1)
			.inputFileType('raw')
			.inputEncoding('floating-point')
		var output = sox.output(mumbleInputStream)
			.outputSampleRate('48k')
			.outputEncoding('signed')
			.outputBits(16)
			.outputChannels(1)
			.outputFileType('raw');
		sox.run();
		ws.on('message', function(data) {
			websocketStreamInput.write(data);
		});
	}

	function setupMumbleToBrowser(ws) {
		var sox = new Sox(mumbleOutputStream)
			.inputSampleRate('48k')
			.inputBits(16)
			.inputChannels(1)
			.inputFileType('raw')
			.inputEncoding('signed')
		var output = sox.output(websocketStreamOutput)
			.outputSampleRate('44.1k')
			.outputBits(32)
			.outputEncoding('floating-point')
			.outputChannels(1)
			.outputFileType('raw');
		sox.run();
		websocketStreamOutput.on('data', function(data) {
			ws.send(data, { binary: true, mask: true });
		});
	}

	function handle(ws) {
		//ws.on('open', function() {
			setupBrowserToMumble(ws);
			setupMumbleToBrowser(ws);
			console.log("Stream accepted");
		//});
	}
}
