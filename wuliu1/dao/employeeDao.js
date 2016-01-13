// dao/employeeDao.js
// 实现与MySQL交互
var mysql = require('mysql');
	crypto = require('crypto');

var $conf = require('../conf/db.js');
// var $util = require('../util/util');
var $sql = require('./employeeSqlMapping');
var cons=require('../conf/const.js');

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
	addEmp: function(req, res, callback) {	// register page
		var cmd = 'SELECT empId FROM employee WHERE empId = ?';
		var emp = {
			empId : req.body.empId,
			empName : req.body.empName,
			empPassword : req.body.empPassword,
			deptId:req.session.deptId,
			empPhone:req.body.empPhone,
			empBirth : req.body.empBirth,
			entryDate : req.body.entryDate,
			gender:req.body.gender,
			job:req.body.job,
			email:req.body.email,
			empqq:req.body.empqq,
			account:req.body.account,
			eduDegree:req.body.eduDegree,
			depositbank2:req.body.depositbank2,
			school:req.body.school,
			home:req.body.home,
			marital:req.body.marital,
			creditid:req.body.creditid,
			ethnic:req.body.ethnic,
			political:req.body.political,	
		};
		emp.empPassword=crypto.createHash('sha1').update(emp.empPassword).digest('hex');
		var d = new Date();
        var nowTime = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
        if (!emp.entryDate) {emp.entryDate=nowTime};
        emp.empBirth=cons.unitConvert("date" , emp.empBirth);

		pool.getConnection(function(err, connection){
			connection.query(cmd, [emp.empId], function(err, result) {
				if (err||result.length!=0) {
					console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
					result={
						code:500,
						mes:"员工编号已存在！"
					}
					connection.release();
					callback(result);
					return 0;
				} 
				
				console.log("empdept:"+emp.deptId);
				var cmd = 'INSERT INTO employee SET ?';
				connection.query(cmd, [emp], function(err, result) {
					if (err) {
						console.log(err);
						result={
							code:500,
							mes:"添加错误，请联系管理员！"
						}
						connection.release();
						callback(result);
						return 0;
					}

					if (emp.job=="快递员") {
						var delivercmd = 'INSERT INTO deliveryMan SET ?' ;
						var deliveryMan={
							empId:emp.empId,
							responArea:null,
							派件票数: 0,
							所属网点: null,
							收件票数:0,
						}
						connection.query(delivercmd, deliveryMan, function(err, result){
							console.log("add deliveryMan");
							if (err) {
								console.log(err);
								result={
									code:500,
									mes:"添加快递职工错误，请联系管理员！"
								}
							}
						})
					}
					if (emp.job=="司机") {
						var drivercmd = 'INSERT INTO driver (empId, licenseType) VALUES(?,?)';
						connection.query(drivercmd, [emp.empId, null], function(err, result){
							if (err) {
								console.log(err);
								result={
									code:500,
									mes:"添加司机职工错误，请联系管理员！"
								}
							}
						})
					}
					
					result={
						code:200,
						mes:"添加成功"
					}
					connection.release();
					callback(result);
					
				});
			});
		});	
	},

	deleteEmps:function(req, res, callback){
		var select=req.body.id;
		console.log(req.body);
		pool.getConnection(function(err, connection) {
			if (select instanceof Array) {
			//删除多个
				for (var i = select.length - 1; i >= 0; i--) {
					connection.query($sql.deleteById, select[i], function(err, result) {
						if(result.affectedRows > 0) {
							result = {
								code: 200,
								msg:'删除成功'
							};
						} else {
							result = void 0;
						}
					// jsonWrite(res, result);
				
					});
				}
			}else{
				// 删除单个
				connection.query($sql.deleteById, select, function(err, result) {
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
	deleteById: function (empId, res, next) {
		// delete by Id
		pool.getConnection(function(err, connection) {
			connection.query($sql.deleteById, empId, function(err, result) {
				if(result.affectedRows > 0) {
					result = {
						code: 200,
						msg:'删除成功'
					};
				} else {
					result = void 0;
				}
				// jsonWrite(res, result);
				connection.release();
			});
		});
	},
	update: function (req, res, callback) {
		// update by id
		var param = req.body;
		if(param.empName == null || param.empBirth == null || param.empPhone == null) {
			jsonWrite(res, undefined);
			return;
		}
		var pwd = crypto.createHash('sha1').update(param.empPassword).digest('hex');
		// param.empPassword = crypto.createHash('sha1').update(param.empPassword).digest('hex');
 
		pool.getConnection(function(err, connection) {
			connection.query($sql.empInfo, param.empId, function(err, result){
				if (err) {
					console.log(err);
					result={
						code:500,
						mes:"更新错误！"
					}
					callback(result);
					return 0;
				}

				if (!param.empBirth) {param.empBirth=result[0].empBirth;}
				else{
					param.empBirth = cons.unitConvert("date" , param.empBirth);
				}

				if (!param.entryDate) {param.entryDate=result[0].entryDate;}
				else{
					param.entryDate = cons.unitConvert("date" , param.entryDate);
				}

				if (param.empPassword==result[0].empPassword) 
					{
						pwd=result[0].empPassword;
					}else{
						pwd=crypto.createHash('sha1').update(result[0].pwd).digest('hex');
					}

				param.deptId=req.session.deptId;
				connection.query($sql.update, [
					pwd, 
					param.empPhone,  
					param.entryDate, 
					param.empBirth, 
					param.job, 
					param.deptId, 
					param.empName,
					param.entryDate,
					param.gender,
					param.account,
					param.eduDegree,
					param.depositbank2,
					param.empqq,
					param.email,
					param.school,
					param.home,
					param.marital,
					param.creditid,
					param.ethnic,
					param.political,
					param.empId], function(err, result) {
					if(err) {
						console.log(err);
						result={
								code:500,
								mes:"更新错误！"
							}
						return 0;
					} 
					result={
						code:200,
						mes:"员工信息更新成功！"
					}
					var job=param.job;
					if (job=="快递员") {
						var delivercmd='update deliveryMan SET responArea=? , 派件票数=?, 所属网点=?, 收件票数=? where empId=?';
						connection.query(delivercmd, [param.responArea, param.派件票数, param.所属网点, param.收件票数, param.empId], function(err, result)
						{
							if(err) {
								console.log(err);
								result={
									code:500,
									mes:"更新错误！"
								}
								callback(result);
								return 0;
							}else{
								result={
									code:200,
									mes:"更新快递员成功！"
								}
							}
						});
					}
					if (job=="司机") {
						var carcmd='update driver SET licenseType=? where empId=?';
						connection.query(carcmd, [param.licenseType , param.empId], function(err, result)
						{
							if(err) {
								console.log(err);
								result={
									code:500,
									mes:"更新错误！"
								}
								callback(result);
								return 0;
							}else{
								result={
									code:200,
									mes:"更新司机成功！"
								}
							}
						});
					};
					connection.release();
					callback(result); 
				});
			})
			
		});
 
	},
	empInfo: function (empId, res, callback) {
		// queryById: 'select * from employee where empId=?',
	
		pool.getConnection(function(err,connection){
			connection.query($sql.empInfo, empId, function(err, result){
				if (err) {
					console.log(err);
					result={
						code:500,
						mes:"查询员工信息出错，请联系管理员。"
					}
					connection.release();
					callback(result);
					// return 0;
				}else{
					connection.release();
					result[0].empBirth = cons.unitConvert("date" , result[0].empBirth);
					result[0].entryDate = cons.unitConvert("date" , result[0].entryDate);
					result[0].code=200;
					callback(result[0]);	
				}
				
			})
		});
	},
	deliverInfo: function (empId, res, callback) {
		// queryById: 'select * from employee where empId=?',
		var cmd = 'select * from deliveryMan where empId=? ';
		pool.getConnection(function(err,connection){
			console.log("empId:"+empId);
			connection.query(cmd, empId, function(err, result){
				if (err) {
					console.log(err);
					result={
						code:500,
						mes:"查询快递员信息出错，请联系管理员。"
					}
					callback(result);
					return 0;
				}
				resultdata={
					code:200,
					data:result[0]
				}
				connection.release();
				callback(resultdata);
			})
		});
	},
	driverInfo: function (empId, res, callback) {
		// queryById: 'select * from employee where empId=?',
		var cmd = 'select * from driver where empId=? ';
		pool.getConnection(function(err,connection){
			console.log("empId:"+empId);
			connection.query(cmd, empId, function(err, result){
				if (err) {
					console.log(err);
					result={
						code:500,
						mes:"查询司机信息出错，请联系管理员。"
					}
					callback(result);
					return 0;
				}
				resultdata={
					code:200,
					data:result[0]
				}
				connection.release();
				callback(resultdata);
			})
		});
	},
	queryFreeDriver: function(req, res, callback){
		// var empcmd='SELECT * FROM waybill inner join employee on waybill.sdeliverId=employee.empId WHERE deptId=? and billState!="签收" ';
		var cmd='select * from driver inner join employee on driver.empId=employee.empId where deptId=? and driverState="空闲" ';
		pool.getConnection(function(err, connection){
			connection.query(cmd, req.session.deptId, function(err, qresult){
				console.log(cmd);
				console.log(err);
                if (err) {
                    console.log(err);
                    result={
                        code:500,
                        meg:"更新错误，请联系管理员"
                    }
                }else {
                	if (qresult.length==0) {
	                	result={
	                		code:500,
	                		meg:"没有空闲的司机"
	                	}
               		}
	                else{
	                    result={
	                        code:200,
	                        data:qresult
	                    }
	                }
	            }
                connection.release();
                console.log(result);
                callback(result);   
			});
		});
	},
	queryAll: function (req, res, next) {
		pool.getConnection(function(err, connection) {
			connection.query($sql.queryAll, function(err, result) {
				jsonWrite(res, result);
				connection.release();
			});
		});
	},
	queryByDept:function(req, res, callback){
		
		var job=req.body.job;
		if (req.session.job !="经理") {
			callback('没有此权限');
			return 0;
		};
		// queryBydeptId:'select * from employee where deptId=?',
		
		if (req.params.job) {
			job=req.params.job;
		}
		else if (!job) 
		{
			var job="全部";
		}
		
		pool.getConnection(function(err,connection){
			if (job=="全部") {
				connection.query($sql.queryBydeptId, req.session["deptId"],function(err, result){
				if (err) {
					jsonWrite(res,result);
					return 0;
				}
				console.log("############"+result);
				callback(result);
				})
			}else{
				var cmd = 'select * from employee where deptId=? AND job=?';
					connection.query(cmd, [req.session["deptId"], job],function(err, result){
						if (err) {
							jsonWrite(res,result);
							return 0;
						}
						callback(result);
					})
				}
			connection.release();
		});
	},
	queryByName:function(req, res, next){
		// queryByName:'select * from employee where empName=?',
		pool.getConnection(function(err,connection){
			connection.query($sql.queryByName, req.query.empName,function(err,result){
				jsonWrite(res,result);
				connection.release();
			})
		})
	},

	queryDeliverMegByEmpId: function(empId, res, callback){
		var cmd='select * from deliveryMan where empId=?';
		pool.getConnection(function(err, connection){
			connection.query(cmd, empId, function(err, result){
				if (err) {
					console.log(err);
					connection.release();
					callback(0);
					return 0;
				}
				connection.release();
				callback(result[0]);
			});
		});
	},	
	login: function(emp, session, callback){	// login verify
		pool.getConnection(function(err,connection){
			var pwd = crypto.createHash('sha1').update(emp.pwd).digest('hex');
			var cmd = 'SELECT * FROM employee WHERE empId = ? AND empPassword = ?';
			connection.query(cmd, [emp.lgn, pwd], function(err, result) {
				if (err || result.length == 0) {
					console.log(err);
					callback(0);
					return 0;
				}
				// var user={
				// 	uid:emp.lgn,
				// 	deptId:result[0]["deptId"],
				// 	lgn:result[0].empName,
				// 	job:result[0].job
				// }
				session.user=result[0];


				session["uid"] = emp.lgn;
				session.deptId = result[0]["deptId"];
				session.lgn = result[0].empName;
				session["job"]=result[0].job;
				console.log(session);
				
				connection.release();
				callback(1);
			});
		})
	}
};