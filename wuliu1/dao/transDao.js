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
    addTransMes: function(custom, res, callback) {  // register page
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

    deleteTransMesByBillId:function(req, res, callback){
        var select=req.body.id;
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
    // 连接查询运输及入库信息
    queryByBillId: function (billId, res, callback) {
        var cmd='select * from transMes warehouse where billId = ? ';
        var ljoincmd='select transMes.billId, transMes.入库时间, warehouse.warehId, warehouse.wareAdd  from transMes left join warehouse on transMes.warehId=warehouse.warehId where billId = ?'
        pool.getConnection(function(err,connection){
            connection.query(ljoincmd, billId, function(err, result){
                if (err) {
                    console.log("################transDao  err");
                    console.log(err);
                    result={
                        code:500
                    }
                    connection.release();
                    callback(result);
                    return 0;
                }else if (result.length==0) {
                    result={
                        code:500,
                        mes:"没有运输信息"
                    }
                    connection.release();
                    callback(result);
                }else{
                    connection.release();
                    result.code=200;
                    console.log("################transDao");
                    console.log(result);
                    callback(result);   
                }
                
            })
        });
    },
    queryGoodsMegByWarehId: function (warehId, res, callback) {
        console.log("**********queryGoodsMegByWarehId************");
        console.log(warehId);
        var cmd='select * from transMes where warehId = ? ';
        var ljoincmd='select *  from transMes left join waybill on transMes.billId=waybill.billId where transMes.warehId = ? AND transMes.入库时间< now() AND transMes.出库时间 is null'
        // var ljoincmd='select *  from transMes left join waybill on transMes.billId=waybill.billId where transMes.warehId = ? AND transMes.入库时间< now() '
        pool.getConnection(function(err,connection){
            connection.query(ljoincmd, warehId, function(err, result){
                if (err) {
                    console.log("################transDao  err");
                    console.log(err);
                    result={
                        code:500
                    }
                    connection.release();
                    callback(result);
                    return 0;
                }else if (result.length==0) {
                    result={
                        code:500,
                        mes:"没有货物信息"
                    }
                    connection.release();
                    callback(result);
                }else{
                    connection.release();
                    result.code=200;
                    console.log("################transDao");
                    console.log(result);
                    callback(result);   
                }
                
            })
        });
    }, 
    querywareHistoryByWarehId: function (warehId, res, callback) {
        console.log("**********queryGoodsMegByWarehId************");
        console.log(warehId);
        var cmd='select * from transMes where warehId = ? ';
        // var ljoincmd='select *  from transMes left join waybill on transMes.billId=waybill.billId where transMes.warehId = ? AND transMes.入库时间< now() AND transMes.出库时间 is null'
        var ljoincmd='select *  from transMes left join waybill on transMes.billId=waybill.billId where transMes.warehId = ? AND transMes.出库时间 is not null '
        pool.getConnection(function(err,connection){
            connection.query(ljoincmd, warehId, function(err, result){
                if (err) {
                    console.log("################transDao  err");
                    console.log(err);
                    result={
                        code:500
                    }
                    connection.release();
                    callback(result);
                    return 0;
                }else if (result.length==0) {
                    result={
                        code:500,
                        mes:"没有货物信息"
                    }
                    connection.release();
                    callback(result);
                }else{
                    connection.release();
                    result.code=200;
                    console.log("################transDao");
                    console.log(result);
                    callback(result);   
                }
                
            })
        });
    }, 

    setOutWareTime: function(req, res, callback){
        console.log("setOutWareTime");
        var warehId=req.body.warehId;

        console.log(warehId);
        var bills=req.body.bills;
        console.log(bills);
        // string.Format("select * from Users(nolock) where UserID in({0})", userIds);
        var cmd="update transMes SET 出库时间= now() where billId in "+ bills +" AND warehId="+"'"+ warehId+"'";
        // var cmd='update transMes SET 出库时间= now() where billId in ? AND warehId=?';
        console.log(cmd);
        pool.getConnection(function(err, connection){
            connection.query(cmd, function(err, result){
                console.log("################transDao################");
                if (err) {
                    console.log("################transDao  err");
                    console.log(err);
                    result={
                        code:500,
                        meg:"操作失败，请重试！"
                    }
                    connection.release();
                    callback(result);
                    return 0;
                }else{
                    connection.release();
                    result={
                        code:200,
                        meg:"操作成功"
                    }
                    console.log(result);
                    callback(result);   
                }
            });
        })
    },
    updateInWareTime: function(req, res, callback){
        var cmd='update transMes SET 入库时间=? where transId=?';
        pool.getConnection(function(err, connection){
            connection.query(cmd, function(err,result){
                if (err) {
                    console.log("################transDao  err");
                    console.log(err);
                    result={
                        code:500,
                        meg:"操作失败，请重试！"
                    }
                    connection.release();
                    callback(result);
                    return 0;
                }else{
                    connection.release();
                    result={
                        code:200,
                        meg:"操作成功"
                    }
                    console.log(result);
                    callback(result);   
                }          
            });
        }); 
    },
    updateOutWareTime: function(req, res, callback){
        var transId;
        var cmd='update transMes SET 出库时间=? where transId=?';
        pool.getConnection(function(err, connection){
            connection.query(cmd,[], function(err,result){
                if (err) {
                    console.log("################transDao  err");
                    console.log(err);
                    result={
                        code:500,
                        meg:"操作失败，请重试！"
                    }
                    connection.release();
                    callback(result);
                    return 0;
                }else{
                    connection.release();
                    result={
                        code:200,
                        meg:"操作成功"
                    }
                    console.log(result);
                    callback(result);   
                }          
            });
        }); 
    }
};