var path = require("path");

var Koa = require("koa");
var app = new Koa();

// 静态文件支持
var koaStatic = require("koa-static");
app.use(koaStatic(path.resolve(__dirname, ".")));

// socket支持
var server = require('http').createServer(app.callback());
var io = require('socket.io')(server);

io.on("connection", function(socket){

	console.log("get one connection ...");
	
	socket.on("from_client", function(clinetData){
		console.log("get message from client:", clinetData);
		socket.emit("news", "hello client !");
	})

	socket.on("disconnect", function(){
		console.log("disconnect one connection ...");
	})
})

server.listen(3000, function() {
	console.log("chat server start on port [3000] ...");
});