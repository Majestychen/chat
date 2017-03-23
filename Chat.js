var Chat = function() {
	this.socketMap = {}
}

Chat.prototype = {
	constructor: Chat,

	welcome: function(socket) {
		var savedSocket = this.socketMap[socket];
		if(savedSocket && savedSocket.status == "authed"){
			// already authed, nothing  todo
		}else {
			socket.emit("msg", {
				type: "system",
				msg: "请输入密码加入聊天 ..."
			});
		}
	},

	regist: function(socket) {
		this.socketMap[socket] = {
			status: "authed"
		}
	}

}