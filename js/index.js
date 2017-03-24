'use strict'

$(function() {

	var socket = null;

	init();
	bindEvent();

	function init() {

		// var host = "192.168.99.103";
		var host = "192.168.196.184"
		socket = io("http://" + host + ":3000");

		_setRole(socket);

		socket.on("msg", function(msg) {

			if(msg.type.indexOf("authed") != -1){
				var role = $.cookie("role");
				socket.emit("msg", "set_role:" + role);
			}

			_addMsg(msg);
		});

	}

	function bindEvent() {
		$(".input button[type='button']").on("click", _sendMsg);
		$(".input").keypress(function(e) {
			if (e.which == 13) {
				_sendMsg();
			}
		})

	}

	// 发送消息
	// 自己发送的消息， 直接表示，同时发送到服务器
	// 自己发送的消息， 先表示为灰色，服务器接收后ack回来，再变成正常颜色
	function _sendMsg() {
		var $text = $(".input input[type='text']");
		var msgValue = $text.val();
		var role = $.cookie("role") || "female";
		var msg = {
			type: "msg sending " + role,
			msg: msgValue
		}
		$text.val("");

		var $msgDiv = _addMsg(msg);
		_emit(msgValue, $msgDiv);
	}

	// 显示消息： 自己发送的 + 从服务器接收的
	function _addMsg(msg) {

		var className = msg.type;
		var msgContent = msg.msg;

		msgContent = msgContent.trim();
		if (/^\d{6,6}$/.test(msgContent) === true) {
			// 认证密码输入，不显示
			return;
		}

		var $contentArea = $(".content_area");
		var $div = $("<div class='line'></div>");
		$div
			.html(msgContent)
			.addClass(className)
			.appendTo($contentArea);

		$div[0].scrollIntoView();

		return $div;
	}

	function _emit(msg, $div) {
		socket.emit("msg", msg, function(_id) {
			if (!$div) {
				return;
			}
			$div.attr("_id", _id);
			$div.removeClass("sending");
		});
	}

	function _setRole(socket) {
		var role = $.cookie("role");
		if (!role) {
			var $roleSelectDiv = $("<div class='line role'><span>请选择角色：</span><button class='male'>男士</button><button class='female'>女士</button></div>");
			$roleSelectDiv.appendTo($(".content_area"));
			$(document).off("click.role").on("click.role", "div.role button", function() {
				var role = this.className;
				$("div.role").remove();
				$.cookie("role", role, {expires: 365});
			});
		}
	}
})