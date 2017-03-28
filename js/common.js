"use strict";

// global variables
if(!window.emotions){
	window.emotions = {};
}


(function(){

jsExt();

function jsExt(){

    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}

})();