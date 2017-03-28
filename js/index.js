'use strict'

$(function() {

	var socket = null;

	initSocket();
	initTextarea();
	initEmotionBtn();
	initSendBtn();

	function initSocket() {

		// var host = "192.168.99.103";
		// var host = "192.168.196.184"
		var host = window.location.hostname;
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

	function initTextarea(){
		// 使用autosize插件，让textarea自动高度
		autosize($("textarea"));

		$(document).on("autosize:resized", function(){
			var taHeight = $("textarea").height();
			var bottomHeight = taHeight + 10;
			$(".bottom").height(bottomHeight + "px");
			$(".top").css({
				"bottom": bottomHeight + "px"
			});
			_scrollIntoView();
		})
	}

	function initSendBtn() {
		$("#send").on("click", _sendMsg);
		$("div.input").keypress(function(e) {
			if ((e.keyCode == 13  || e.keyCode == 10) && e.ctrlKey) {
				_sendMsg();
			}
		})

	}

	function initEmotionBtn(){
		$("button.emotion").emotion({
			input: $("textarea")
		});
	}

	// 发送消息
	// 自己发送的消息， 直接表示，同时发送到服务器
	// 自己发送的消息， 先表示为灰色，服务器接收后ack回来，再变成正常颜色
	function _sendMsg() {
		var $ta = $("textarea");
		var msgValue = $ta.val();
		msgValue = msgValue.trim();
		if(!msgValue || msgValue == ""){
			return;
		}

		var role = $.cookie("role") || "female";
		var msg = {
			type: "msg sending " + role,
			msg: msgValue
		}
		$ta.val("");
		autosize.update($ta);
		$ta.focus();

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

		msgContent = msgContent.replace(/\n|(\r\n)/g, "<br/>");

		var $contentArea = $(".content_area");
		var $div = $("<div class='line'></div>");
		$div
			.html(msgContent)
			.addClass(className)
			.appendTo($contentArea);

		_scrollIntoView();

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

	function _scrollIntoView(){
		var $div = $(".content_area .line:last")[0];
		if($div){
			$div.scrollIntoView();
		}
	}
})