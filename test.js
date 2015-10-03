var Speaker = require("speaker");
var io = require("socket.io")(http);
var WS = require('websocket-stream');
var http = require('http');
var FS = require('fs');
var Mumble = require('mumble');
var Sox = require('sox-audio');

Mumble.connect("92k.de", function(error, connection) {
	connection.authenticate('webmumbletest');
	connection.on('initialized', function() { mumbleUp(connection); });
});

function mumbleUp(connection) {

	var httpserv = http.createServer();
	var server = WS.createServer({server: httpserv}, handle);
	httpserv.listen(8081, "127.0.0.1");

	console.log('Server running at http://127.0.0.1:8081/');

	var is = connection.inputStream();
	//var is = FS.createWriteStream("out_48k.pcm");
	function handle(stream) {
		var sox = new Sox(stream)
			.inputSampleRate('44.1k')
			.inputBits(32)
			.inputChannels(1)
			.inputFileType('raw')
			.inputEncoding('floating-point')
		var output = sox.output(is)
			.outputSampleRate('48k')
			.outputEncoding('signed')
			.outputBits(16)
			.outputChannels(1)
			.outputFileType('raw');
		sox.run();
		console.log("Stream accepted");
		/*stream.on('data', function(chunk) {
			var resampledData = Samplerate.resample(chunk, 44100, 48000, 1);
			is.write(resampledData);
		});*/
	}
}
