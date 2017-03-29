var path = require("path");

// KOA
var Koa = require("koa");
var app = new Koa();
var koaStatic = require("koa-static");
app.use(koaStatic(path.resolve(__dirname, "..")));

// MONGO DB
var db = require("./mongo.js");
var mongoose = require("mongoose");
var conn = db.init();
var Log = conn.model("log");

// socket支持
var server = require('http').createServer(app.callback());
var io = require('socket.io')(server);


var socketMap = {};

io.on("connection", function(socket) {

	// 初始化socket
	initSocket(socket);

	// 提示身份认证
	if(_checkAuth(socket) === false){
		return;
	}

	// 已经认证的话，表示欢迎信息
	_authOk(socket);

});

function initSocket(socket){

	// socket.on('msg' ...)
	initSocketMsg(socket);

	// socket.on('disconnect' ...)
	initSocketDisConnect(socket);
}

function initSocketMsg(socket){
	socket.on("msg", function(msg, ackFn) {

		// 身份认证
		if(_isAuth(msg)){
			socketMap[socket.id] = {
				socket: socket,
				status: "authed"
			}
			_authOk(socket);
		}

		// 检查身份认证
		if(_checkAuth(socket) === false){
			return;
		}

		// 设定role
		if (_isRole(msg)) {
			var role = msg.split(":")[1];
			socketMap[socket.id].role = role;
			return;
		}

		// 普通消息
		// 消息保存
		Log.add({
			msg: msg,
			role: socketMap[socket.id].role || "none",
		}, function(_id){
			// Db登陆成功，返回db中的_id
			ackFn(_id);
		});
		// 消息广播
		var sockets = _getAuthedSockets(socket);
		var role = socketMap[socket.id].role || 'female';
		sockets.forEach((s) => {
			s.emit("msg", {
				type: "msg " + role,
				msg: msg
			})
		})
	})
}

function initSocketDisConnect(socket){

	socket.on("disconnect", function(){
		var socketId = socket.id;
		var socketInfo = socketMap[socketId];
		
		if(!socketInfo){
			return
		}

		var isAuthed = socketInfo.status == "authed";
		var role = _getRoleName(socketInfo.role);
		if(isAuthed){
			var sockets = _getAuthedSockets(socket);
			sockets.forEach((s) => {
				s.emit("msg", {
					type: "system",
					msg: role + "离开了..."
				})
			})
		}
		delete socketMap[socketId];
	});

}

function _checkAuth(socket){

	var socketInfo = socketMap[socket.id];
	if (!socketInfo || socketInfo.status != 'authed') {
		socket.emit("msg", {
			type: "system",
			msg: "欢迎，请认证身份"
		});
		return false;
	} else {
		return true;
	}

}

function _authOk(socket){
	var authedCount = 0;
	for(var key in socketMap){
		if(socketMap[key].status == "authed"){
			authedCount++;
		}
	}
	socket.emit("msg", {
		type: "system authed",
		msg: "认证成功，您现在可以开始聊天啦~"
	});
	socket.emit("msg", {
		type: "system",
		msg: "当前在线人数: " + authedCount
	});

	var sockets = _getAuthedSockets(socket);
	sockets.forEach((s) => {
		s.emit("msg", {
			type: "system",
			msg: "有人进入了聊天，当前在线人数：" + authedCount
		});
	})
}

function _isAuth(msg) {
	return msg == "123456"
}

function _isRole(msg){
	return /^set_role:.*?$/.test(msg);
}

function _getAuthedSockets(myselfSocket) {

	var resultArr = [];
	for (var key in socketMap) {
		var socketInfo = socketMap[key];
		if (socketInfo.status == 'authed') {

			// 如果参数传递了自身的socket，那么排除自己
			if (myselfSocket && myselfSocket.id == socketInfo.socket.id) {
				continue;
			}

			resultArr.push(socketInfo.socket);
		}
	}
	return resultArr;
}

function _getRoleName(role){
	return role == "male" ? "男士" : "女士";
}

server.listen(3000, function() {
	console.log("chat server start on port [3000] ...");
});