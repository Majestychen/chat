"use strict";

// global variables
if (!window.emotions) {
	window.emotions = {};
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

			var nowDate = new Date();
			var todayFlag = false;
			if (year == nowDate.getFullYear() && month == (nowDate.getMonth() + 1) && day == nowDate.getDate()) {
				todayFlag = true;
			}
			if (todayFlag === true) {
				return "{0}-{1}-{2} {3}:{4}:{5}".format(year, month, day, hour, minute, second);
			} else {
				return "{0}:{1}:{2}".format(hour, minute, second);
			}
		}

	}


})();