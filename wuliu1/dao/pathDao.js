// dao/employeeDao.js
// 实现与MySQL交互
var mysql = require('mysql');

var $conf = require('../conf/db.js');
 
// 使用连接池，提升性能
// var pool  = mysql.createPool($util.extend({}, $conf.mysql));
var pool=mysql.createPool($conf.mysql);
 
module.exports = {
	addcy: function(cy, res, callback) {	// register page
		var scmd = 'SELECT cyId FROM shipper WHERE cyId = ?';
		pool.getConnection(function(err, connection){
			connection.query(scmd, [cy.cyId], function(err, result) {
				if (err||result.length!=0) {
					callback(0);
					return 0;
				} 
				var icmd = 'INSERT INTO shipper SET ?';
				connection.query(icmd, cy, function(err, result) {
					if (err) {
						console.log(err);
						callback(0);
						return 0;
					}
					callback(1);
					connection.release();
				});
			});
		});	
	},

	deleteCy:function(cyId, res, callback){
		pool.getConnection(function(err, connection) {
		var cmd = 'delete from shipper where cyId=?';
				connection.query(cmd, cyId, function(err, result) {
						if(result.affectedRows > 0) {
							result = {
							code: 200,
							msg:'删除成功'
							};
						} else {
							result = void 0;
						}
				});
			connection.release();
			callback("success");
		});
	},
	queryAll: function (req, res, callback) {
		var cmd='select * from 线路信息';

		pool.getConnection(function(err, connection) {
			connection.query(cmd, function(err, result) {
				if (err) {
					callback(0);
					return 0;
				} 
				connection.release();	
				callback(result);
			});
		});
	},
	queryCyById: function (cyId, res, callback) {
		var cmd='select * from shipper where cyId=?';
		pool.getConnection(function(err,connection){
			connection.query(cmd, cyId, function(err, result){
				if (err) {
					return 0;
				}
				connection.release();
				callback(result[0]);
			})
		});
	},
	queryByName:function(req, res, next){
		var cmd='select * from shipper where name=?';
		pool.getConnection(function(err,connection){
			connection.query(cmd, req.query.name,function(err,result){
				jsonWrite(res,result);
				connection.release();
			})
		});
	}
};