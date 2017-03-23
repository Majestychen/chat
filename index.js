$(function(){

	var socket = null;

	init();
	bindEvent();

	function bindEvent(){
		$("#send").on("click", function(){
			$text = $(".input_area input[type='text']");
			var msgValue = $text.val();
			var msg = {
				type: "msg",
				msg: msgValue
			}
			$text.val("");

			_addMsg(msg);
			_emit(msgValue);
		});
	}

	function _addMsg(msg){
		var $contentArea = $(".content_area");
		var className = msg.type;
		var msgContent = msg.msg;
		$("<div class='line'></div>").html(msgContent).addClass(className).appendTo($contentArea);
	}

	function _emit(msg){
		socket.emit("msg", msg);
	}

	function init(){

		// var host = "192.168.99.103";
		var host = "127.0.0.1"
		socket = io("http://" + host + ":3000");

		socket.on("msg", function(msg){
			_addMsg(msg);
		});
	}
})