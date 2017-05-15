require("../js/common.js");

var db = require("./mongo.js");
var mongoose = require("mongoose");


var conn = db.init();
var Log = conn.model("log");

// var logInfo = {
// 	role: "male",
// 	msg: "好姐姐"
// }

// Log.add(logInfo, (_id) => {
// 	Log.findOne({_id: _id}, function(err, record){
// 		console.log(record.msg, record.createtime);
// 	})
// })

// var id = "58d485f5550a131ca8561dda"

// Log.update(id, "jjj", function(){
// 	Log.findOne({_id: id}, function(err, record){
// 		console.log(record.msg, record.createtime);
// 	})
// })


// var id = "58d485f5550a131ca8561dda"

// Log.delete(id, function(){
// 	console.log("delete done");
// 	Log.findOne({_id: id}, function(err, record){
// 		if(err){
// 			console.log(err);
// 		}else {
// 			// console.log(record.msg, record.createtime);
// 		}
// 	})
// })


var d = new Date();
var s = d.nDayBefore(5);
var e = d.nDayBefore(1);;
Log.findByRange(s,e, function(records){
	records.forEach(function(r){
		console.log(r.createtime, r.msg)
	})
})