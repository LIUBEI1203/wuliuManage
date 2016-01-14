var originalRequest=require('request');
var cheerio=require('cheerio');
var debug=require('debug')('ddstwl:update:read');

@param {http://www.ddstwl.com/index.php} url
@param {} callback

function request(url, callback){
	originalRequest(url,callback);
}