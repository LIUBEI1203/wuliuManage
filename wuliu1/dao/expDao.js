// var originalRequest=require('request');
var cheerio=require('cheerio');
	mysql = require('mysql');

var $conf = require('../conf/db.js');

function request(url, callback){
	originalRequest(url, callback);
}

// 使用连接池，提升性能
// var pool  = mysql.createPool($util.extend({}, $conf.mysql));
var connection=mysql.createPool($conf.mysql);

module.exports = {
	queryExpByBillIdAndCyId: function(exp, res, callback) {
		var cmd = 'SELECT * FROM waybill WHERE billId =? AND cyId=? ';
		connection.query(cmd, [exp.billId, exp.cyId], function(err, result) {
			if (err || result.length == 0) {
				console.log("err:"+err);
				result={
					code:500,
					mes:"未查询到该快递单"
				}
				callback(result);
				return 0;
			}	
			result[0].code=200;
			callback(result[0]);
		});
	},
	queryTransMesBybillId: function(req, res, callback) {	
		var cmd = 'SELECT * FROM waybill WHERE billId = ? AND cyId = ?';
		connection.query(cmd, req.body.billId, req.body.cyId,function(err, result) {
			if (err || result.length == 0) {
				console.log(err);
				callback(0);
				return 0;
			}
			else{
				console.log(result);
			}	
			callback(1);
		});
	}
}