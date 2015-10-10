/*
 * Includes
 */
var WS = require('ws');
var Mumble = require('mumble');
var Sox = require('sox-audio');
var PassThroughStream = require('stream').PassThrough;
var FS = require('fs');
var Opus = require('node-opus');
var Ogg = require('ogg');
/*
 * Constants
 */
var PORT = 8081;
var IP = "0.0.0.0";
var MUMBLE_URL = "92k.de"
var MUMBLE_PASSWORD = "";
var MUMBLE_USER = "Webmumble_Test";
var MUMBLE_CHANNEL = "Flur (Öffentlich)";
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
	var mumbleInputStream = FS.createWriteStream("encoded.pcm");
	//var mumbleInputStream = connection.inputStream();
	var websocketStreamInput = new PassThroughStream();
	var websocketStreamOutput = new PassThroughStream();
	var mumbleOutputStream = new PassThroughStream();
	connection.on("voice", function(data) {
		mumbleOutputStream.write(data);
	});

	function setupBrowserToMumble(ws) {
		var rate = 48000;
		var frameSize = rate / 200;
		var oggDecoder = new Ogg.Decoder();
		oggDecoder.on('stream', function (stream) {
			var opus = new Opus.Decoder();
			opus.on('format', function(format) {
				console.log(format);
				opus.pipe(mumbleInputStream);
			});
			opus.on('error', function(err) {
				console.error(err);
			});
			stream.pipe(opus);
		});
		ws.on('message', function(buffer) {
			oggDecoder.write(buffer);
			//mumbleInputStream.write(buffer);
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
