// dao/employeeDao.js
// 实现与MySQL交互
var mysql = require('mysql');
    crypto = require('crypto');

var $conf = require('../conf/db.js');
var cons= require('../conf/const.js');
 
// 使用连接池，提升性能
// var pool  = mysql.createPool($util.extend({}, $conf.mysql));
var pool=mysql.createPool($conf.mysql);
 
module.exports = {
    update: function (req, res, callback) {
        // update by id
        var param = req.body;

        var queryByIdcmd='select * from users where userEmail=?';
        var updatecmd='update users set userName=?, userGender=?, userPhone=?, pwd=? where userEmail=? ';
        pool.getConnection(function(err, connection) {
            connection.query(queryByIdcmd, param.userEmail, function(err, result){
                if (err) {
                    // jsonWrite(res,result);
                    return 0;
                }
                console.log(req);
                if (!param.userName) {param.userName=result[0].userName;};
                if (!param.userPhone) {param.userPhone=result[0].userPhone;};
                if (!param.userGender) {param.userGender=result[0].userGender};
                if (param.pwd!=result[0].pwd) {
                        var pwd = crypto.createHash('sha1').update(param.pwd).digest('hex');
                        param.pwd=pwd;
                    }
                connection.query(updatecmd, [param.userName, param.userGender, param.userPhone, param.pwd, param.userEmail], function(err, result) {
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
    queryById: function (netId, res, callback) {
        var cmd='select * from network where netId=? ';
        pool.getConnection(function(err,connection){
            connection.query(cmd, netId, function(err, result){
                    if (err) {
                        result={
                            code:500
                        }
                        callback(result)
                        // return 0;
                    }
                    connection.release();
                    callback(result[0]);
                })
        });
    },
    login: function(user, session, callback){    // login verify
        pool.getConnection(function(err,connection){
            var pwd = crypto.createHash('sha1').update(user.pwd).digest('hex');
            var cmd = 'SELECT * FROM users WHERE userEmail = ? AND pwd = ?';
            connection.query(cmd, [user.lgn, pwd], function(err, result) {
                if (err || result.length == 0) {
                    console.log(err);
                    callback(0);
                    return 0;
                }

                session.user=result[0];

                session["uid"] = user.lgn;
                session.lgn = result[0].userName;
                session["job"]="客户";
                console.log(session);
                
                connection.release();
                callback(1);
            });
        })
    }
};