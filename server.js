var path = require("path");

var Koa = require("koa");
var app = new Koa();

// 静态文件支持
var koaStatic = require("koa-static");
app.use(koaStatic(path.resolve(__dirname, ".")));

// socket支持
var server = require('http').createServer(app.callback());
var io = require('socket.io')(server);


var socketMap = {};

io.on("connection", function(socket) {

	var savedSocket = socketMap[socket];
	if (!savedSocket || savedSocket.status != 'authed') {
		socket.emit("msg", {
			type: "system",
			msg: "欢迎，请认证身份"
		});
	} else {
		socket.emit("msg", {
			type: "system",
			msg: "您现在可以开始聊天啦"
		});
	}

	socket.on("msg", function(msg) {
		if (_isAuth()) {
			socketMap[socket] = {
				status: 'authed'
			}
		} else {
			var sockets = _getAuthedSockets(socket);
			sockets.forEach((s) => {
				s.emit("msg", {
					type: "msg",
					msg: msg
				})
			})
		}
	})


});


function _isAuth(msg) {
	return msg == "123456"
}

function _getAuthedSockets(myselfSocket) {

	var resultArr = [];
	for (var key in socketMap) {
		if (key.status == 'authed') {

			// 如果参数传递了自身的socket，那么排除自己
			if (myselfSocket && myselfSocket == socket) {
				continue;
			}

			resultArr.push(key);
		}
	}
	return resultArr;
}

server.listen(3000, function() {
	console.log("chat server start on port [3000] ...");
});