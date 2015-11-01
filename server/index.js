var Express = require('express');
var http = require('http');
var Client = require("./client");
var BinaryServer = require('binaryjs').BinaryServer;
var config = require("../config.json");

var num = 0;
var clients = [];

var app = Express();

var httpServer = http.createServer(app);

var binaryServer = new BinaryServer({
	server : httpServer
});

app.use("/",  Express.static("client/"));
app.use('/jquery', Express.static('node_modules/jquery/dist/'));
app.use('/binaryjs', Express.static('node_modules/binaryjs/dist/'));
app.use("/bundle.js", Express.static("dist/bundle.js"));
app.use("/bundle.css", Express.static("dist/bundle.css"));
app.use("/bootstrap", Express.static("node_modules/bootstrap/dist/"));
app.use("/bootswatch", Express.static("node_modules/bootswatch/"));
app.use("/fontawesome", Express.static("node_modules/font-awesome/"));

binaryServer.on("connection", function(socket){
	console.log("Client connected");
	clients.push(new Client(socket));
});

httpServer.listen(config.siteport, function(){
	console.log("Webmumble is listening to port " + config.siteport);
});
