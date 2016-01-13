// dao/employeeDao.js
// 实现与MySQL交互
var mysql = require('mysql');

var $conf = require('../conf/db.js');
 
// 使用连接池，提升性能
// var pool  = mysql.createPool($util.extend({}, $conf.mysql));
var pool=mysql.createPool($conf.mysql);

// 向前台返回JSON方法的简单封装
var jsonWrite = function (res, ret) {
	if(typeof ret === 'undefined') {
		res.json({
			code:'1',
			msg: '操作失败'
		});
	} else {
		res.json(ret);
	}
};
 
module.exports = {
	addComp: function(custom, res, callback) {	// register page
		var scmd = 'SELECT compId FROM custom WHERE compId = ?';
		pool.getConnection(function(err, connection){
			connection.query(scmd, [custom.compId], function(err, result) {
				if (err||result.length!=0) {
					callback(0);
					return 0;
				} 
				var icmd = 'INSERT INTO custom SET ?';
				connection.query(icmd, custom, function(err, result) {
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

	deleteComp:function(req, res, callback){
		var select=req.body.id;
		console.log("****************************"+select);
		var cmd='delete  from custom where compId=?';
		pool.getConnection(function(err, connection) {
			if (select instanceof Array) {
			//删除多个
				for (var i = select.length - 1; i >= 0; i--) {
					connection.query(cmd, select[i], function(err, result) {
						if (err) {
							return 0;
						}
						if(result.affectedRows > 0) {
							result = {
							code: 200,
							msg:'删除成功'
							};
						} else {
							result = void 0;
						}
					});
				}
			}else{
				// 删除单个
				connection.query(cmd, select, function(err, result) {
						if(result.affectedRows > 0) {
							result = {
							code: 200,
							msg:'删除成功'
							};
						} else {
							result = void 0;
						}
				});
			}
			
			connection.release();
			callback("success");
		});
	},
	update: function (req, res, callback) {
		// update by id
		var param = req.body;
		var queryByIdcmd='select * from custom where compId=?';
		var updatecmd='update custom set compName=?, phoneNo=?, contactor=?, address=?, depositBank=?, account=?, compType=?  where compId=? ';
		pool.getConnection(function(err, connection) {
			connection.query(queryByIdcmd, param.compId, function(err, result){
				if (err) {
					jsonWrite(res,result);
					return 0;
				}
				console.log(req);
				if (!param.compName) {param.compName=result[0].compName;};
				if (!param.phoneNo) {param.phoneNo=result[0].phoneNo;};
				if (!param.contactor) {param.contactor=result[0].contactor};
				if (!param.address) {param.address=result[0].address};
				if (!param.depositBank) {param.depositBank=result[0].depositBank};
				if (!param.account) {param.account=result[0].account};
				if (!param.compType) {param.compType=result[0].compType};


				console.log(param);
				connection.query(updatecmd, [
					param.compName, 
					param.phoneNo, 
					param.contactor, 
					param.address, 
					param.depositBank, 
					param.account, 
					param.compType, 
					param.compId
					], function(err, result) {
					if(err) {
						// jsonWrite(res,result);
						return 0;
					} 
					connection.release();
					callback(1); 
				});
			})
			
		});
 
	},
	queryById: function (compId, res, callback) {
		// queryById: 'select * from employee where empId=?',
		var cmd='select * from custom where compId=?';
		pool.getConnection(function(err,connection){
			connection.query(cmd, compId, function(err, result){
				if (err) {
					jsonWrite(res,result);
					return 0;
				}
				connection.release();
				console.log(result[0]);
				callback(result[0]);
			})
		});
	},
	queryAll: function (req, res, callback) {
		var cmd='select * from custom';
		pool.getConnection(function(err, connection) {
			connection.query(cmd, function(err, result) {
				connection.release();
				// jsonWrite(res,result);
				callback(result);
			});
		});
	}
};