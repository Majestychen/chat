"use strict";

// 客户端和服务端共用的js文件

var isClient = true;
try {
	window
} catch (e) {
	isClient = false;
}

if (isClient === true) {
	// 客户端
	// global variables
	if (!window.emotions) {
		window.emotions = {};
	}
}


(function() {

	jsExt();

	function jsExt() {

		// String.format
		String.prototype.format = function() {
			var args = arguments;
			return this.replace(/{(\d+)}/g, function(match, number) {
				return typeof args[number] != 'undefined' ? args[number] : match;
			});
		};

		// Date.getFormatOutput
		Date.prototype.getFormatOutput = function() {
			var year = this.getFullYear();
			var month = this.getMonth() + 1;
			var day = this.getDate();
			var hour = this.getHours();
			var minute = this.getMinutes();
			var second = this.getSeconds();

			hour = addZero(hour,2);
			minute = addZero(minute,2);
			second = addZero(second, 2);

			var nowDate = new Date();
			var todayFlag = false;
			if (year == nowDate.getFullYear() && month == (nowDate.getMonth() + 1) && day == nowDate.getDate()) {
				todayFlag = true;
			}
			if (todayFlag === true) {
				return "{0}:{1}:{2}".format(hour, minute, second);
			} else {
				return "{0}-{1}-{2} {3}:{4}:{5}".format(year, month, day, hour, minute, second);
			}
		}

		// Date.nHourBefore
		Date.prototype.nHourBefore = function(hourCount) {
			var onMinute = 60 * 1000;
			var oneHour = 60 * onMinute;
			var resultDate = new Date(this.getTime() - oneHour * hourCount);
			return resultDate;
		}

		// Date.nDayBefore
		Date.prototype.nDayBefore = function(dayCount) {
			var onMinute = 60 * 1000;
			var oneHour = 60 * onMinute;
			var oneDay = 24 * oneHour;
			var resultDate = new Date(this.getTime() - oneDay * dayCount);
			return resultDate;
		}

		function addZero(param, len){
			var str = param + "";
			var count = len - str.length;
			if(count <=0 ){
				return str;
			}else {
				var zeroArr = Array.apply(null, {length: count}).map(function(){return "0"});
				return zeroArr.join("") + str;
			}
		}

	}


})();