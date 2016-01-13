// var originalRequest=require('request');
var mysql = require('mysql');

var $conf = require('../conf/db.js');
var cons=require('../conf/const.js');
// var pool  = mysql.createPool($util.extend({}, $conf.mysql));
var connection=mysql.createPool($conf.mysql);

module.exports = {
	queryAllWare: function(req, res, callback) {	
		var cmd = 'SELECT * FROM warehouse';
		connection.query(cmd, function(err, result) {
			if (err || result.length == 0) {
				console.log(err);
				callback(0);
				return 0;
			}
			else{
				console.log(result);
				callback(result);
			}		
			
		});
	},
	queryAllCar: function(req, res, callback) {	
		var cmd = 'SELECT * FROM car';
		connection.query(cmd, function(err, result) {
			if (err || result.length == 0) {
				console.log(err);
				queryresult={
					code:500,
					meg:'没有找到符合条件的车辆'
				}
				callback(queryresult);
				return 0;
			}
			else{
				var i=result.length;
				do{
					i--;
					result[i].purchaseTime=cons.unitConvert('date', result[i].purchaseTime);
				}while(i)
				queryresult={
					code:200,
					data:result
				}
				console.log(result);
			}	
			callback(queryresult);
		});
	},
    queryFreeCar: function(req, res, callback){
        var cmd='select * from car where carStatus="空闲" ';
        connection.query(cmd, function(err, result){
            if (err || result.length == 0) {
                console.log(err);
                queryresult={
                    code:500,
                    meg:'没有找到符合条件的车辆'
                }
                callback(queryresult);
                return 0;
            }
            else{
                var i=result.length;
                do{
                    i--;
                    result[i].purchaseTime=cons.unitConvert('date', result[i].purchaseTime);
                }while(i)
                queryresult={
                    code:200,
                    data:result
                }
                console.log(result);
            }   
            callback(queryresult);
        });
    },
	queryBywarehId: function(warehId, res, callback) {	
		var cmd = 'SELECT * FROM warehouse WHERE warehId=?';
		connection.query(cmd, warehId,function(err, result) {
			if (err || result.length == 0) {
				console.log(err);
				result={
					code:500,
					mes:"仓库查询出错，仓库或许不存在"
				}
				callback(result);
				return 0;
			}
			else{
				result[0].code=200;
				console.log(result);
				callback(result[0]);
			}
		});
	},
	addWare: function(req, res, callback){
		var temp=req.body.jsonString;
		console.log(temp);
		var wareData=JSON.parse(temp);
		if (!wareData.wareCap) {wareData.wareCap=0};
		var cmd = 'SELECT warehId FROM warehouse WHERE warehId = ?';
		connection.query(cmd, [wareData.warehId], function(err, result) {
			if (err||result.length!=0) {
				console.log(err);
				result={
					code:500,
					mes:"仓库编号已存在！"
				}
				callback(result);
				return 0;
			} 
			var cmd = 'INSERT INTO warehouse SET ?';
			console.log(wareData);
			connection.query(cmd, wareData, function(err, result) {
				if (err) {
					console.log(err);
					result={
						code:500,
						mes:"添加错误！"
					};
					callback(result);
				}else{
					result={
						code:200,
						mes:"添加成功"
					}
					callback(result);
				}
			});
		});
	},
	addCar: function(req, res, callback){
		var temp=req.body.jsonString;
		console.log(temp);
		var carData=JSON.parse(temp);

		var cmd = 'SELECT carId FROM car WHERE carId = ?';
		connection.query(cmd, [carData.carId], function(err, result) {
			if (err||result.length!=0) {
				console.log(err);
				result={
					code:500,
					mes:"车辆编号已存在！"
				}
				callback(result);
				return 0;
			} 
			var cmd = 'INSERT INTO car SET ?';
			console.log(carData);
            if (!carData.carLen) {carData.carLen=null;};
			connection.query(cmd, carData, function(err, result) {
				if (err) {
					console.log(err);
					result={
						code:500,
						mes:"添加错误！"
					};
					callback(result);
				}else{
					result={
						code:200,
						mes:"添加成功"
					}
					callback(result);
				}
			});
		});
	},
	deleteWare:function(req, res, callback){
		var select=req.body.id;
		console.log(req.body);
		var cmd='delete from warehouse where warehId=? ';
		if (select instanceof Array) {
			//删除多个
			console.log("shanchuduoge")
				for (var i = select.length - 1; i >= 0; i--) {
					connection.query(cmd, select[i], function(err, result) {
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
				console.log("shanchu")
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
			callback("success");
	},
	deleteCar:function(req, res, callback){
		var param=req.body.jsonString;
        var car = JSON.parse(param);
		var cmd='delete from car where carId=? ';
		connection.query(cmd, car.carId, function(err, result) {
			if(!err && result.affectedRows > 0) {
				result = {
					code: 200,
					msg:'删除成功'
				};
			} else {
				console.log(err);
				result = {
					code:500,
					msg:'失败'
				}
			}
			callback(result);
		});
	},
	queryCarByNo: function(req, res, callback){
		var cmd='select * from car where carNo=? ';
        connection.query(cmd, req.body.carNo, function(err, result){
            if (err ) {
            	result={
            		code:500,
            		meg:'查找错误'
            	}
            	callback(queryresult);
                return 0;
            }
            if (result.length==0) {
            	queryresult={
            		code:500,
            		meg:'未能找到符合条件的车辆'
            	}
            	console.log(queryresult);
            	callback(queryresult);
            }else{
            	queryresult={
            		code:200,
            		data:result,
            		meg:'查找成功'
            	}
            	console.log(queryresult);
            	callback(queryresult);
            }
        });
	},
	queryByStatus: function(req, res, callback){
        var cmd='select * from car where carStatus=? ';
        connection.query(cmd, req.body.carStatus, function(err, result){
            if (err) {
            	queryresult={
            		code:500,
            		meg:'查找错误'
            	}
            	callback(queryresult);
                return 0;
            }if (result.length==0) {
            	queryresult={
            		code:500,
            		meg:'未能找到符合条件的车辆'
            	}
            	console.log(queryresult);
            	callback(queryresult);
            }
            else{
            	queryresult={
            		code:200,
            		data:result,
            		meg:'查找成功'
            	}
            	console.log(queryresult);
            	callback(queryresult);

            }
        });
	},
	updateCar: function(req, res, callback){
		var param = req.body.jsonString;
        var car = JSON.parse(param);
        console.log(car.carId);
        console.log("yuanshi"+car.purchaseTime);
        var purchaseTime=cons.unitConvert('date', car.purchaseTime);
        console.log(purchaseTime);
        var cmd='update car SET purchaseTime=?, carType=?, carStatus=?, carNo=? WHERE carId=?';
        connection.query(cmd, [
                    purchaseTime,  
                    car.carType, 
                    car.carStatus, 
                    car.carNo,
                    car.carId
                    ], function(err, result) {
                  	if(err) {
                        console.log(err);
                        result = {
                            code: 500,
                            msg:'更新错误，请重试'
                        };
                        callback(result);
                        return 0;
                    } 
                    result = {
                        code: 200,
                        msg:'suc'
                    };
                    callback(result); 
        });
	}
}