// dao/employeeDao.js
// 实现与MySQL交互
var mysql = require('mysql');

var $conf = require('../conf/db.js');
var cons= require('../conf/const.js');
 
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
    addnet: function(req, res, callback) {  
        var scmd = 'SELECT netId FROM network WHERE netId = ?';
        var param = req.body.jsonString;
        console.log("param:"+param);
        var temp = JSON.parse(param);
        console.log("temp:"+temp.netId);
        var d = new Date();
        var nowTime = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
                console.log("tome:"+nowTime);

        var pwd=crypto.createHash('sha1').update(temp.netPassword).digest('hex');
        console.log("pwd:"+pwd);

        var net = {
            netId: temp.netId,
            deptId: req.session.deptId,
            netName: temp.netName,
            netPassword: pwd,
            manager: temp.manager, 
            managerPhone: temp.managerPhone,
            netAdd: temp.netAdd,
            bank: temp.bank,
            bankAccount: temp.bankAccount,
            joinTime: nowTime,
            descript: temp.descript,
        };
        console.log("netId:"+net.netId);
        console.log("####################################net:"+net);
        pool.getConnection(function(err, connection){
            console.log("netAddDao");
            connection.query(scmd, [net.netId], function(err, result) {
                if (err||result.length!=0) {
                    console.log(err);
                    result = {
                        code: 500,
                        msg:'网点编号已存在'
                    };
                    connection.release();
                    callback(result);
                } 
                var icmd = 'INSERT INTO network SET ?';
                connection.query(icmd, net, function(err, result) {
                    console.log("$$$$$$$$$$$$$$$$$$$$$$$$"+net);
                    if (err) {
                        console.log(err);
                        result = {
                        code: 500,
                        msg:'添加失败'
                        };
                        connection.release();
                        callback(result);
                    }
                    result = {
                        code: 200,
                        msg:'添加成功'
                    };
                    connection.release();
                    callback(result); 
                    
                });
            });
        }); 
    },

    delete: function(req, res, callback){
        var cmd='delete  from network where netId=?';
        var param=req.body.jsonString;
        var net = JSON.parse(param);
        pool.getConnection(function(err, connection) {
            connection.query(cmd, net.netId, function(err, result) {
                    if(result.affectedRows > 0) {
                        result = {
                            code: 200,
                            msg:'删除成功'
                        };
                    } else {                            
                        result = {
                            code: 500,
                            msg:'删除错误，请重试'
                        };
                    }
                    connection.release();
                    callback(result);
                });
            
        });
    },
    update: function (req, res, callback) {
        // update by id
        
        var param = req.body.jsonString;
        var net = JSON.parse(param);
        var netId=net.netId;
        var queryByIdcmd='select * from network where netId = ?';
        var updatecmd='update network set netName=?, manager=?, managerPhone=?, netAdd=?, bank=?, bankAccount=?, joinTime=?, descript=?  WHERE netId= ?';
        pool.getConnection(function(err, connection) {
            console.log("netId:"+netId);
            connection.query(queryByIdcmd, netId, function(err, result){
                if (err) {
                    console.log(err);
                    result = {
                        code: 500,
                        msg:'更新错误，请重试'
                    };
                    return 0;
                }
                var d = new Date();
                var joinTime = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
                if (net.joinTime) {joinTime = cons.unitConvert("date" , net.joinTime); };
                // var pwd=crypto.createHash('sha1').update(param.netPassword).digest('hex');
                connection.query(updatecmd, [
                    net.netName,  
                    net.manager, 
                    net.managerPhone, 
                    net.netAdd, 
                    net.bank, 
                    net.bankAccount, 
                    joinTime,
                    net.descript,
                    net.netId
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
                    connection.release();
                    result = {
                        code: 200,
                        msg:'suc'
                    };
                    callback(result); 
                });
            })
            
        });
 
    },
    queryByIdAndName: function (req, res, callback) {
        console.log("queryByIdAndName req.body.netId"+req.body.netId);
        var cmd='select * from network where netId=? or netName=?';
        pool.getConnection(function(err,connection){
            if (req.body.netId) {
                connection.query(cmd, [req.body.netId, req.body.netName], function(err, result){
                    if (err) {
                        jsonWrite(res,result);
                        return 0;
                    }
                    connection.release();
                    console.log("^^^^^^^^^^^^"+result);
                    callback(result);
                })
            }else if (req.body.netName) {
                connection.query(cmd, [req.body.netId, req.body.netName], function(err, result){
                    if (err) {
                        jsonWrite(res,result);
                        return 0;
                    }
                    connection.release();
                    console.log(result);
                    callback(result);
                })
            };
        });
    },
    queryById: function (netId, res, callback) {
        var cmd='select * from network where netId=? ';
        pool.getConnection(function(err,connection){
            connection.query(cmd, netId, function(err, result){
                    if (err) {
                        result={
                            code:500
                        }
                        connection.release();
                        callback(result)
                        // return 0;
                    }else{
                        connection.release();
                        result[0].code=200;
                        callback(result[0]);
                    }
                })
        });
    },
    queryAll: function (req, res, callback) {
        var cmd='select * from network where deptId=? ';
        pool.getConnection(function(err, connection) {
            connection.query(cmd, req.session.deptId, function(err, result) {
                connection.release();
                callback(result);
            });
        });
    },
    login: function(net, session, callback){    // login verify
        pool.getConnection(function(err,connection){
            var pwd = crypto.createHash('sha1').update(net.pwd).digest('hex');
            var cmd = 'SELECT *  FROM network WHERE netId = ? AND netPassword = ?';
            connection.query(cmd, [net.lgn, pwd], function(err, result) {
                if (err || result.length == 0) {
                    console.log(err);
                    callback(0);
                    return 0;
                }

                session.user=result[0];

                session["uid"] = net.lgn;
                session.deptId = result[0]["deptId"];
                session.lgn = result[0].netName;
                session["manager"]=result[0].manager;
                session["job"]="网点";
                console.log(session);
                
                connection.release();
                callback(1);
            });
        })
    }
};