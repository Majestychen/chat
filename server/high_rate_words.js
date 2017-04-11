var nodejieba = require("nodejieba");
var path = require("path");

nodejieba.load({
	userDict: path.resolve(__dirname, 'dict', 'userdict.utf8')
});

var result = nodejieba.cut("好姐姐我是，this is my book, 红掌拨清波牛牛牛哥哥一二三四五臂距离 男默女泪 ab爱爱c捅刀我暗刀");
console.log(result);