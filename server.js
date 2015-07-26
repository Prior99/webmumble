var app = require('express')();
var http = require('http').Server(app);
var io = require("socket.io")(http);
var Client = require("./server/client.js");

var config = require("./config.json");

var clients = [];

app.get("/", function(req, res){
    // console.log(req.query);
    res.sendFile(__dirname + "/client/index.html");
});
app.get("/style.css", function(req, res){
    // console.log(req.query);
    res.sendFile(__dirname + "/client/style.css");
});

io.on("connection", function(socket){
    console.log("Client connected");
    clients.push(new Client(socket));
});

http.listen(config.siteport, function(){
    console.log("Webmumble is listening to port " + config.siteport);
});
