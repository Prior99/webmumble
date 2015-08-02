var app = require('express')();
var http = require('http').Server(app);
var io = require("socket.io")(http);
var Client = require("./server/client.js");

var config = require("./config.json");

var num = 0;
var clients = {};

app.get("/", function(req, res){
    // console.log(req.query);
    res.sendFile(__dirname + "/client/index.html");
});
app.get("/style.css", function(req, res){
    // console.log(req.query);
    res.sendFile(__dirname + "/client/style.css");
});

// app.get("/client/*.js", function(req, res){
	// res.sendFile(__dirname + "/client/js/" + req.params[0] + ".js");
// });

// app.get("/shared/*.js", function(req, res){
	// res.sendFile(__dirname + "/shared/" + req.params[0] + ".js");
// });

app.get("/dist/*.js", function(req, res){
	res.sendFile(__dirname + "/dist/" + req.params[0] + ".js");
})

io.on("connection", function(socket){
    console.log("Client connected");
	socket.on("requestTag", function(){
		var tag = num;
		clients[tag] =  new Client(socket);
		socket.emit("tag", tag);
		num++;
		console.log("Handed out tag " + tag);
	});
	socket.on("showTag", function(tag){
		clients[tag].assignAudioSocket(socket);
		console.log("AudioSocket registered for tag " + tag);
	})
});

http.listen(config.siteport, function(){
    console.log("Webmumble is listening to port " + config.siteport);
});
