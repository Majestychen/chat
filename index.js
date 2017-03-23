$(function(){

	var socket = null;

	init();
	bindEvent();

	console.log("aaaaaaaa");
	function bindEvent(){
		$("#send").on("click", function(){
			console.log("cccccccccccccccc");
			var msg = $(".input_area input[type='text']").val();
			addMsg(msg);
			emit(msg);
		});
	}

	function addMsg(msg){
		console.log(msg);
		$("<div class='msg'></div>").html(msg).appendTo($(".content_area"));
	}

	function emit(msg){
		socket.emit("msg", msg);
	}

	function init(){

		// var host = "192.168.99.103";
		var host = "127.0.0.1"
		socket = io("http://" + host + ":3000");

	}
})