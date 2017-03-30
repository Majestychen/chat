'use strict'

$(function() {

	var imgWidth = 269;
	var imageHeight = 241;
	var singleSizeW = 34
	var singleSizeH = 35
	var imgName = "2";
	var imgExt = "jpg";

	var rowCount = parseInt(imageHeight / singleSizeH, 10);
	var colCount = parseInt(imgWidth / singleSizeW, 10);

	var imgPath = "/imgs/" + imgName + "." + imgExt;


	$.fn.emotion = function(options) {

		var $input = options.input;

		var $baseDom = $(this);

		initPopSelect($input);
		initButton($baseDom, $input, options.btnClickCallback);
		registToGlobal();
	};

	function initPopSelect($input) {
		var $popSelect = $('<div class="emotion popup"></div>')
			.addClass("emotion_" + imgName)
			.appendTo($(document.body));

		for (var i = 0; i < colCount; i++) {
			for (var j = 0; j < rowCount; j++) {
				var posid = "{0}_{1}_{2}".format(imgName, i,j);
				var bgxy = _getBGXY(i,j);
				var background = "white url('{0}') {1}px {2}px".format(imgPath, bgxy[0], bgxy[1]);
				$('<div class="tile"></div>').css({
					"width": singleSizeW + "px",
					"height": singleSizeH + "px",
					"float": "left",
					"cursor": "pointer",
					"background": background
				})
				.attr("posid", posid)
				.appendTo($popSelect)
				.on("click", function(){
					var $this = $(this);
					var posid = $this.attr("posid");
					$input.jqSelection().replaceSelection("[" + posid + "]");
					$input.focus();
				});
			}
		}
	}

	function initButton($baseDom, $input, callback){
		$baseDom.on("click", function(){
			var className = "emotion_" + imgName;
			var $popSelect = $("." + className);
			$popSelect.toggle();

			$input.focus();
			
			if(callback){
				callback();
			}
		});
	}

	function registToGlobal(){
		var gEmotions = window.emotions;
		gEmotions[imgName] = {
			imgPath: imgPath,
			singleSizeW: singleSizeW,
			singleSizeH: singleSizeH
		}
	}

	function _getBGXY(x, y) {
		return [singleSizeW * x * -1, singleSizeH * y * -1]
	}

});