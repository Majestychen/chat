var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = mongoose.ObjectId;
var fs = require("fs");
var path = require("path");

var PWD = fs.readFileSync(path.resolve("/root", "mongo_pwd.txt")).toString().trim();
var PORT = 27777;


var dbName = process.env.NODE_ENV == "product" ? "chat" : "chat_dev"
var hostName = process.env.NODE_ENV == "product" ? "db" : "localhost"

function init() {
	var connUrl = "mongodb://super:" + pwd + "@" + hostName + ":" + PORT + "/" + dbName;
	console.log(connUrl);
	
	console.log("connUrl", connUrl);
	var conn = mongoose.createConnection(connUrl);
	conn.on("error", (err) => console.log("connection error, ", err));
	defineSchema(conn);
	return conn;

}

function defineSchema(conn) {

	var LogSchema = defineLogSchema(conn);
	conn.model("log", LogSchema); // mongoose会默认找表名为复数形式的表

	console.log("==  define model done ==");
}

function defineLogSchema() {
	var LogSchema = new Schema({
		"role": String,
		"msg": String,
		"createtime": {
			type: Date,
			default: Date.now
		}
	});

	LogSchema.path("createtime").get(function(v) {
		return formatDateTime(v);
	});

	LogSchema.statics.add = function(logInfo, callback) {
		var Log = this;
		var log = new Log(logInfo);

		log.save(function(err) {
			if (err) {
				console.error("LogSchema.add error !!", err);
			} else {
				callback(log._id);
			}

		});
	}

	LogSchema.statics.delete = function(_id, callback) {
		var Log = this;
		Log.remove({
			"_id": _id
		}, (err) => {
			if (err) {
				console.error("LogSchema delete error !", err);
			} else {
				callback();
			}
		});
	}

	LogSchema.statics.update = function(_id, msg, callback) {
		var Log = this;
		Log.findOne({
			"_id": _id
		}, function(err, record) {
			if (err) {
				console.error("LogSchema update ERROR !", err);
			} else {
				record.msg = msg;
				record.save(callback);
			}
		});
	}

	LogSchema.statics.findByRange = function(startDate, endDate, callback) {
		var Log = this;
		Log.find({
			createtime: { $lte: endDate, $gte: startDate}
		}, function(err, record) {
			if (err) {
				console.error("LogSchema findByRange ERROR !", err);
			} else {
				callback(record);
			}
		});
	}

	return LogSchema;
}

function formatDateTime(date) {
	return date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
}


module.exports.init = init;