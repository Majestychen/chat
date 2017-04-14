'use strict'

$(function() {

	var socket = null;

	initSocket();
	initTextarea();
	initEmotionBtn();
	initSendBtn();
	initWindowResize();

	initOsSystem();

	function initSocket() {

		var host = window.location.hostname;
		socket = io("http://" + host + ":3005");

		_setRole(socket);

		socket.on("msg", function(msg) {

			// 认证成功
			if (msg.type.indexOf("authed") != -1) {
				var role = $.cookie("role");
				socket.emit("msg", "set_role:" + role);
			}

			// 历史消息显示
			if (_historyMsg(msg) === true) {
				return;
			}

			// 统计消息
			if (_statisticMsg(msg) === true) {
				return;
			}

			_addMsg(msg);
		});

	}

	function initTextarea() {
		// 使用autosize插件，让textarea自动高度
		autosize($("textarea"));

		$(document).on("autosize:resized", function() {
			var taHeight = $("textarea").height();
			var bottomHeight = taHeight + 5;
			$(".bottom").height(bottomHeight + "px");
			$(".top").css({
				"bottom": bottomHeight + 10 + "px"
			});
			_scrollIntoView();
		})
	}

	function initSendBtn() {
		function _doSendMsg(e) {
			_sendMsg();
			$("div.emotion.popup").hide();
		}

		$("#send").on("click", _doSendMsg);
		$("div.input").keypress(function(e) {
			if ((e.keyCode == 13 || e.keyCode == 10) && e.ctrlKey) {
				_doSendMsg(e);
			}
		})

	}

	function initEmotionBtn() {
		$(".button.emotion").emotion({
			input: $("textarea")
		});
	}

	function initWindowResize() {
		$(window).on("resize", function() {
			setTimeout(function() {
				_scrollIntoView();
			}, 0);
		})
	}

	function _historyMsg(msg) {
		if (msg.type == "history") {
			var $contentArea = $(".content_area");
			$contentArea.find(".line").remove();
			$contentArea.find(".statistic").remove();
			var logArr = JSON.parse(msg.msg);
			for (var i = logArr.length - 1; i >= 0; i--) {
				var msgItem = logArr[i];
				var $lineDiv = _getLineDiv({
					type: "msg " + msgItem.role,
					msg: msgItem.msg,
					time: msgItem.createtime
				});
				$lineDiv.appendTo($contentArea);
			}
			_scrollIntoView();
			return true;
		}
		return false;
	}

	function _statisticMsg(msg) {
		if (msg.type == "statistic") {
			var $contentArea = $(".content_area");

			var msg = JSON.parse(msg.msg);
			var $div = $('<div class="statistic"></div>');
			var $tb = $('<table></table>');
			var $tr = $('<tr></tr>');
			$('<td></td>').html("统计时长").appendTo($tr);
			$('<td></td>').html(msg.unitCount + (msg.unit == 'd' ? "天" : "小时")).appendTo($tr);
			$tr.appendTo($tb);

			$tr = $('<tr></tr>');
			$('<td></td>').html("开始时间").appendTo($tr);
			$('<td></td>').html(new Date(msg.startDate).getFormatOutput()).appendTo($tr);
			$tr.appendTo($tb);

			$tr = $('<tr></tr>');
			$('<td></td>').html("结束时间").appendTo($tr);
			$('<td></td>').html(new Date(msg.endDate).getFormatOutput()).appendTo($tr);
			$tr.appendTo($tb);

			$tr = $('<tr></tr>');
			$('<td></td>').html("男士（句子）").appendTo($tr);
			$('<td></td>').html(msg.lineCountMale).appendTo($tr);
			$tr.appendTo($tb);

			$tr = $('<tr></tr>');
			$('<td></td>').html("女士（句子）").appendTo($tr);
			$('<td></td>').html(msg.lineCountFemale).appendTo($tr);
			$tr.appendTo($tb);

			$tr = $('<tr></tr>');
			$('<td></td>').html("男士（字数）").appendTo($tr);
			$('<td></td>').html(msg.wordCountMale).appendTo($tr);
			$tr.appendTo($tb);

			$tr = $('<tr></tr>');
			$('<td></td>').html("女士（字数）").appendTo($tr);
			$('<td></td>').html(msg.wordCountFemale).appendTo($tr);
			$tr.appendTo($tb);

			var wordRateObj = msg.wordRateObj;
			if (wordRateObj) {

				var allRateArr = wordRateObj["all"];
				var maleRateArr = wordRateObj["male"];
				var femaleRateArr = wordRateObj["female"];

				var rateStr = "";
				allRateArr.forEach(function(item) {
					rateStr += "<span>{0}({1})</span>".format(item[0], item[1]);
				})
				$tr = $('<tr></tr>');
				$('<td></td>').html("全部词频").appendTo($tr);
				$('<td></td>').html(rateStr).appendTo($tr);
				$tr.appendTo($tb);

				rateStr = "";
				maleRateArr.forEach(function(item) {
					rateStr += "<span>{0}({1})</span>".format(item[0], item[1]);
				})
				$tr = $('<tr></tr>');
				$('<td></td>').html("男士词频").appendTo($tr);
				$('<td></td>').html(rateStr).appendTo($tr);
				$tr.appendTo($tb);

				rateStr = "";
				femaleRateArr.forEach(function(item) {
					rateStr += "<span>{0}({1})</span>".format(item[0], item[1]);
				})
				$tr = $('<tr></tr>');
				$('<td></td>').html("女士词频").appendTo($tr);
				$('<td></td>').html(rateStr).appendTo($tr);
				$tr.appendTo($tb);
			}

			$tb.appendTo($div);
			$div.appendTo($contentArea);
			_scrollIntoView($("div.statistic:last")[0]);

			return true;
		}

		return false;
	}

	// 发送消息
	// 自己发送的消息， 直接表示，同时发送到服务器
	// 自己发送的消息， 先表示为灰色，服务器接收后ack回来，再变成正常颜色
	function _sendMsg() {
		var $ta = $("textarea");
		var msgValue = $ta.val();
		msgValue = $.trim(msgValue);
		if (!msgValue || msgValue == "") {
			return;
		}

		var role = $.cookie("role") || "female";
		var msg = {
			type: "msg sending " + role,
			time: new Date().getTime(),
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

		// 认证密码输入，不显示
		var msgContent = msg.msg;
		if (/^\d{6,6}$/.test(msgContent) === true) {
			return;
		}

		// 命令 - 历史消息 , 不显示
		if (/^\d{6,6}:\d+$/.test(msgContent) === true) {
			return;
		}

		// 命令 - 统计 , 不显示
		if (/^\d{6,6}:tj:\d+[h|d]$/.test(msgContent) === true) {
			return;
		}

		var $contentArea = $(".content_area");
		var $lineDiv = _getLineDiv(msg);
		$lineDiv.appendTo($contentArea);

		_scrollIntoView();

		return $lineDiv;
	}

	function _getLineDiv(msg) {

		var className = msg.type;
		var msgContent = msg.msg;
		var unixtime = msg.time;

		// 换行的处理
		msgContent = msgContent.replace(/\n|(\r\n)/g, "<br/>");

		// 表情符号的处理
		var reg = new RegExp("\\[(.*?)\\]", "g");
		var matchResult = null;
		while (matchResult = reg.exec(msgContent)) {
			if (matchResult == null) {
				break;
			}

			var infoStr = matchResult[1];
			var infoArr = infoStr.split("_");
			var imgName = infoArr[0];
			var x = infoArr[1];
			var y = infoArr[2];

			var imgInfo = window.emotions[imgName];
			var imgPath = imgInfo.imgPath;
			var singleSizeW = imgInfo.singleSizeW;
			var singleSizeH = imgInfo.singleSizeH;
			var posx = x * singleSizeW * -1;
			var posy = y * singleSizeH * -1;

			var bg = "white url('{0}') {1}px {2}px".format(imgPath, posx, posy);
			var imgStr = '<span class="emotion" style="display:inline-block;width:{0}px;height:{1}px;background:{2}"></span>'
			imgStr = imgStr.format(singleSizeW, singleSizeH, bg);
			msgContent = msgContent.replace(new RegExp("\\[" + infoStr + "\\]", "g"), imgStr);
		}

		var $div = $("<div class='line'></div>");
		$div
			.html(msgContent)
			.addClass(className)

		// 消息时间
		if (unixtime) {
			$("<div class='time'></div>").html(new Date(unixtime).getFormatOutput()).appendTo($div);
		}

		return $div;
	}

	function _addTimeLine($lineDiv) {
		var unixtime = $lineDiv.attr("unixtime");
		var formatTime = new Date(unixtime).getFormatOutput();
		$('<div class="line system"></div>')
			.html(formatTime)
			.css({
				"text-align": "center"
			})
			.insertBefore($lineDiv)
			.get(0).scrollIntoView();
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
				$.cookie("role", role, {
					expires: 365
				});
			});
		}
	}

	function _scrollIntoView(ele) {
		if (!ele) {
			ele = $(".content_area .line:last")[0];
		}

		if (ele) {
			ele.scrollIntoView();
		}
	}

	function initOsSystem(){
		var os = _getMobileOperatingSystem();
		if(os == "IOS") {
			$(document.body).addClass("ios");
		}
	}

	function _getMobileOperatingSystem() {
	  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

	      // Windows Phone must come first because its UA also contains "Android"
	    if (/windows phone/i.test(userAgent)) {
	        return "Windows Phone";
	    }

	    if (/android/i.test(userAgent)) {
	        return "Android";
	    }

	    // iOS detection from: http://stackoverflow.com/a/9039885/177710
	    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
	        return "IOS";
	    }

	    return "unknown";
	}
})