'use strict'

$(function() {

	var socket = null;

	init();
	bindEvent();

	function init() {

		// var host = "192.168.99.103";
		var host = "192.168.196.184"
		socket = io("http://" + host + ":3000");

		socket.on("msg", function(msg) {
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

	function _sendMsg() {
		var $text = $(".input input[type='text']");
		var msgValue = $text.val();
		var msg = {
			type: "msg",
			msg: msgValue
		}
		$text.val("");

		var $msgDiv = _addMsg(msg);
		_emit(msgValue, $msgDiv);
	}

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
			.addClass("sending")
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

	// function _scrollBottom(ele) {
	// 	var isScrolledToBottom = ele.scrollHeight - ele.clientHeight <= ele.scrollTop + 1;
	// 	console.log("isScrolledToBottom", isScrolledToBottom);
	// 	if (isScrolledToBottom) {
	// 		ele.scrollTop = ele.scrollHeight - ele.clientHeight;
	// 	}
	// }

})