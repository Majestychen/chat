var request = require("request");
var cheerio = require("cheerio");

var test_str = "https://image.baidu.com/search/index?ct=201326592&z=0&tn=baiduimage&ipn=r&word=%E6%83%B3%E4%BD%A0&pn=0&istype=2&ie=utf-8&oe=utf-8&cl=2&lm=-1&st=-1&fr=&fmq=1491811581502_R&ic=0&se=&sme=&width=0&height=0&face=0"


request(test_str, function(error, response, body) {
	if (error) {
		console.log(test_str);
		console.log('error:', error); // Print the error if one occurred
		console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
	}
	console.log('body:', body); // Print the HTML for the Google homepage.
});