$(function() {

	var imgWidth = 447;
	var imageHeight = 401;
	var singleSize = 45
	var imgName = "2";
	var imgExt = "jpg";

	var rowCount = parseInt(imageHeight / singleSize, 10);
	var colCount = parseInt(imgWidth / singleSize, 10);

	var imgName = imgName + "." + imgExt;
	var imgPath = "/imgs/imgName";


	$.fn.emotion = function(options) {

		var $input = options.input;

		var $baseDom = $(this);

		initDom();
	};

	function initDom() {
		var $popSelect = $('<div class="emotion"></div>').appendTo($(document.body));

		$popSelect.css({
			position: "absolute",
			top: 0,
			left: 0,
			padding: "20px"
			width: "100%"
		});

		for (var i = 0; i < colCount; i++) {
			for (var j = 0; j < rowCount; j++) {
				$('<div class="tile"></div>').css({
					"width": singleSize + "px";
					"height": singleSize + "px";
					float: "left";
					background: "url(" + imgPath + ")"
				})
			}
		}
	}

	function _getBGXY(x, y) {
		return [singleSize * x, singleSize * y]
	}

});