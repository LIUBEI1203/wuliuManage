// dao/employeeDao.js
// 实现与MySQL交互
var mysql = require('mysql');

var $conf = require('../conf/db.js');
 
// 使用连接池，提升性能
// var pool  = mysql.createPool($util.extend({}, $conf.mysql));
var pool=mysql.createPool($conf.mysql);
 
module.exports = {
    addzy: function(zy, res, callback) {    // register page
        var scmd = 'SELECT zyId FROM forwarder WHERE zyId = ?';
        pool.getConnection(function(err, connection){
            connection.query(scmd, [zy.zyId], function(err, result) {
                if (err||result.length!=0) {
                    callback(0);
                    return 0;
                } 
                var icmd = 'INSERT INTO forwarder SET ?';
                connection.query(icmd, zy, function(err, result) {
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

    deleteZy:function(zyId, res, callback){
        pool.getConnection(function(err, connection) {
        var cmd = 'delete from forwarder where zyId=?';
                connection.query(cmd, zyId, function(err, result) {
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
    update: function (req, res, callback) {
        // update by id
        var param = req.body;

        var queryByIdcmd='select * from forwarder where zyId=?';
        var updatecmd='update forwarder set name=?, phone=?, contactName=?, shipperAdd=? where zyId=? ';
        pool.getConnection(function(err, connection) {
            connection.query(queryByIdcmd, param.zyId, function(err, result){
                if (err) {
                    // jsonWrite(res,result);
                    return 0;
                }
                console.log(req);
                if (!param.name) {param.name=result[0].name;};
                if (!param.phone) {param.phone=result[0].phone;};
                if (!param.contactName) {contactName=result[0].contactName};
                if (!param.shipperAdd) {shipperAdd=result[0].shipperAdd};
                connection.query(updatecmd, [param.name, param.phone, param.contactName, param.shipperAdd, param.zyId], function(err, result) {
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
    queryZyById: function (zyId, res, callback) {
        // queryById: 'select * from employee where empId=?',
        var cmd='select * from forwarder where zyId=?';
        pool.getConnection(function(err,connection){
            connection.query(cmd, zyId, function(err, result){
                if (err) {
                    // jsonWrite(res,result);
                    return 0;
                }
                connection.release();
                callback(result[0]);
            })
        });
    },
    queryAll: function (req, res, callback) {
        var cmd='select * from forwarder';
        pool.getConnection(function(err, connection) {
            connection.query(cmd, function(err, result) {
                if (err) {
                    result={
                        code:500,
                        mes:"转运商查询错误"
                    }
                    callback(0);
                    return 0;
                } 
                connection.release();   
                callback(result);
            });
        });
    },
    queryCyById: function (zyId, res, callback) {
        var cmd='select * from forwarder where zyId=?';
        pool.getConnection(function(err,connection){
            connection.query(cmd, zyId, function(err, result){
                if (err) {
                    return 0;
                }
                connection.release();
                callback(result[0]);
            })
        });
    },
    queryByName:function(req, res, callback){
        var cmd='select * from forwarder where name=?';
        pool.getConnection(function(err, connection){
            connection.query(cmd, req.body.zyName,function(err,result){
                if (err) {
                    return 0;
                }
                connection.release();
                callback(result[0]);
            })
        });
    }
};