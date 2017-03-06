var Koa = require("koa");
var app = new Koa();

var koaStatic = require("koa-static");
var path = require("path");


app.use(koaStatic(path.resolve(__dirname, ".")));


app.listen(3000, function() {
	console.log("chat server start on port [3000] ...");
});