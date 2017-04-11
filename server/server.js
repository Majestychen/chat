require("../js/common.js");

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

// password
var fs = require("fs");
var password = fs.readFileSync(path.resolve(__dirname, "..", "password.txt")).toString().trim();

// nodejieba
var nodejieba = null;
try {
	nodejieba = require("nodejieba");
} catch (e) {}
if (nodejieba) {
	nodejieba.load({
		userDict: path.resolve(__dirname, 'dict', 'userdict.utf8')
	});
}

var skipWordsArr = fs.readFileSync(path.resolve(__dirname, "dict", "skipwords.utf8")).toString().trim().split(/\n/);
// console.log("skipWordsArr", skipWordsArr);

var socketMap = {};

io.on("connection", function(socket) {

	// 初始化socket
	initSocket(socket);

	// 提示身份认证
	if (_checkAuth(socket) === false) {
		return;
	}

	// 已经认证的话，表示欢迎信息
	_authOk(socket);

});

function initSocket(socket) {

	// socket.on('msg' ...)
	initSocketMsg(socket);

	// socket.on('disconnect' ...)
	initSocketDisConnect(socket);
}

function initSocketMsg(socket) {
	socket.on("msg", function(msg, ackFn) {

		// 取得历史消息
		// ${password}:100
		if (_isGetHistory(msg, socket)) {
			return;
		}

		// 统计功能
		// ${password}:tj:10d
		// ${password}:tj:24h
		if (_isStatistic(msg, socket)) {
			return;
		}

		// 身份认证
		if (_isAuth(msg)) {
			socketMap[socket.id] = {
				socket: socket,
				status: "authed"
			}
			_authOk(socket);
			return;
		}

		// 检查身份认证
		if (_checkAuth(socket) === false) {
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
		}, function(_id) {
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

function initSocketDisConnect(socket) {

	socket.on("disconnect", function() {
		var socketId = socket.id;
		var socketInfo = socketMap[socketId];

		if (!socketInfo) {
			return
		}

		var isAuthed = socketInfo.status == "authed";
		var role = _getRoleName(socketInfo.role);
		if (isAuthed) {
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

function _checkAuth(socket) {

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

function _authOk(socket) {
	var authedCount = 0;
	for (var key in socketMap) {
		if (socketMap[key].status == "authed") {
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
	return msg == password
}

function _isRole(msg) {
	return /^set_role:.*?$/.test(msg);
}

function _isGetHistory(msg, socket) {
	var regExp = new RegExp("^" + password + ":(\\d+)$");
	var match = regExp.exec(msg);
	if (match == null) {
		return;
	}
	var count = parseInt(match[1], 10);
	if (count > 10000) {
		socket.emit("msg", {
			type: "system",
			msg: "请别超过10000 ..."
		});

		return true;
	}

	socket.emit("msg", {
		type: "system",
		msg: "请稍等，数据加载中 ..."
	});

	Log.find({}).sort({
		createtime: -1
	}).limit(count).exec(function(err, data) {
		if (err) {
			console.log(err);
		} else {
			socket.emit("msg", {
				type: "history",
				msg: JSON.stringify(data)
			});

			socketMap[socket.id] = {
				socket: socket,
				status: "authed"
			}
			_authOk(socket);
		}
	});

	return true;
}


function _isStatistic(msg, socket) {
	var regExp = new RegExp("^" + password + ":tj:(\\d+)([h|d])$");
	var match = regExp.exec(msg);
	if (match == null) {
		return;
	}

	socketMap[socket.id] = {
		socket: socket,
		status: "authed"
	}
	_authOk(socket);

	var count = parseInt(match[1], 10);
	var unit = match[2];

	var d = new Date();
	var startDate = null;
	var endDate = null;
	if (unit == "d") {
		startDate = d.nDayBefore(count);
		endDate = d;
	} else {
		startDate = d.nHourBefore(count);
		endDate = d;
	}

	var sockets = _getAuthedSockets();
	sockets.forEach(function(s) {
		s.emit("msg", {
			type: "system",
			msg: "统计进行中，稍后发送结果 ... 您可以继续聊天 "
		});
	});


	var lineCountMale = 0;
	var lineCountFemale = 0;
	var wordCountMale = 0;
	var wordCountFemale = 0;
	Log.findByRange(startDate, endDate, function(records) {

		var recordArrForwordRate = [];

		records.forEach(function(recordItem) {
			var msg = recordItem.msg;
			msg = msg.replace(/\[.*?\]/g, "");
			if (!msg || msg.trim() == "") {
				return;
			}
			if (recordItem.role == "male") {
				lineCountMale++;
				wordCountMale += msg.length;
			}
			if (recordItem.role == "female") {
				lineCountFemale++;
				wordCountFemale += msg.length;
			}
			recordArrForwordRate.push(recordItem);
		});

		var wordRateObj = getWordRate(recordArrForwordRate, 10);

		sockets.forEach(function(s) {
			s.emit("msg", {
				type: "statistic",
				msg: JSON.stringify({
					unit: unit,
					unitCount: count,
					startDate: startDate,
					endDate: endDate,
					lineCountMale: lineCountMale,
					lineCountFemale: lineCountFemale,
					wordCountMale: wordCountMale,
					wordCountFemale: wordCountFemale,
					wordRateObj: wordRateObj
				})
			});
		});
	});

	return true;
}

function getWordRate(recordArr, topNum) {
	if (!nodejieba) {
		return null;
	}
	var recordJiebaArr = recordArr.map((record) => {
		
		// 分词
		var cutArr = nodejieba.cut(record.msg);
		cutArr = cutArr.filter((m) => {
			// 长度小于等于1 的词不要
			if(m.length <= 1 ){
				return false;
			}

			// 不想被统计的词，不要
			if(_inSkipWords(m) === true){
				return false;
			}

			return true;
		});

		return {
			role: record.role,
			msgArr: cutArr
		}
	});

	var allMsgArr = recordJiebaArr;

	var maleMsgArr = recordJiebaArr.filter(function(item) {
		return item.role === "male"
	});

	var femaleMsgArr = recordJiebaArr.filter(function(item) {
		return item.role === "female"
	});

	return {
		all: _getWordRate(allMsgArr, topNum),
		male: _getWordRate(maleMsgArr, topNum),
		female: _getWordRate(femaleMsgArr, topNum)
	}
}

function _getWordRate(recordArr, topNum) {
	var rateObj = {};
	var rateArr = [];

	recordArr.forEach(function(recordItem) {
		var msgArr = recordItem.msgArr;
		msgArr.forEach(function(msg) {
			if (rateObj[msg] == null || rateObj[msg] == undefined) {
				rateObj[msg] = 1;
			} else {
				rateObj[msg] = rateObj[msg] + 1;
			}
		})

	});

	for (var key in rateObj) {
		rateArr.push([key, rateObj[key]]);
	}

	rateArr.sort(function(a, b) {
		if (a[1] == b[1]) {
			return 0;
		} else {
			return a[1] < b[1] ? 1 : -1;
		}
	});

	var resultArr = rateArr.slice(0, topNum);
	return resultArr;
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

function _inSkipWords(word){
	if(skipWordsArr.indexOf(word) != -1){
		return true;
	}else {
		return false;
	}
}

function _getRoleName(role) {
	return role == "male" ? "男士" : "女士";
}

server.listen(3005, function() {
	console.log("chat server start on port [3005] ...");
});