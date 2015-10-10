/*
 * Includes
 */
var WS = require('ws');
var Mumble = require('mumble');
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
	var websocketStreamOutput = new PassThroughStream();
	var mumbleOutputStream = new PassThroughStream();
	connection.on("voice", function(data) {
		mumbleOutputStream.write(data);
	});

	var rate = 48000;
	var frameSize = rate / 200;
	var channels = 1;

	function setupBrowserToMumble(ws) {
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
		var oggEncoder = new Ogg.Encoder();
		var oggStream = oggEncoder.stream();
		var opus = new Opus.Encoder(rate, channels, frameSize);
		opus.on('data', function(data) {
			oggStream.packetin(data);
		});
		oggEncoder.on('data', function(data) {
			ws.send(data);
		});
		mumbleOutputStream.pipe(opus);
		console.log("SET THE FUCKING FUCK UP");
	}

	function handle(ws) {
		setupBrowserToMumble(ws);
		setupMumbleToBrowser(ws);
		console.log("Stream accepted");
	}
}
