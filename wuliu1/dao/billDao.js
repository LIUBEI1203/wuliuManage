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

function getTimeRndString() {
   var tm=new Date();
   var str=tm.getMilliseconds()+tm.getSeconds()*60+tm.getMinutes()*3600+tm.getHours()*60*3600+tm.getDay()*3600*24+tm.getMonth()*3600*24*31+tm.getYear()*3600*24*31*12;
   return str;
};
 
module.exports = {
    addBill: function(req, res, callback) {  // register page
        var scmd = 'SELECT billId FROM waybill WHERE billId = ?';

        console.log(req.session);
        var temp=req.body.jsonString;
        var bill=JSON.parse(temp);
        bill.netId=req.session.uid;
        bill.cyId=null;
        bill.配送编号=null;
        // bill.tranceId=null;
        bill.forwarder=null;
        bill.fnetId=null;
        bill.transportCost=null;
        bill.billstate="收入";
        bill.signatory=null;
        bill.reciptId=null;

        var d = new Date();
        var nowTime = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()+" "+d.getHours()+":"+d.getMinutes();     //获取当前时间;
        bill.sdate=nowTime;
        console.log("bill:"+bill);

        pool.getConnection(function(err, connection){
            connection.query(scmd, [bill.billId], function(err, result) {
                if (err||result.length!=0) {
                    console.log(err);
                    result={
                        code:500,
                        mes:"快递单号已存在！"
                    }
                    callback(result);
                    return 0;
                } 
                var icmd = 'INSERT INTO waybill SET ?';
                connection.query(icmd, bill, function(err, result) {
                    console.log("$$$$$$$$$$$$$$$$$$$$$$$$"+JSON.stringify(bill));
                    if (err) {
                        console.log(err);
                        result={
                            code:500,
                            mes:"添加错误，请联系管理员！"
                        }
                        callback(result);
                        return 0;
                    }
                    result={
                        code:200,
                        mes:"添加成功！"
                    }
                    connection.release();
                    callback(result);
                    
                });
            });
        }); 
    },

     addAppoint: function(req, res, callback) {  // register page
        console.log(req.body);
        var temp=req.body.jsonString;
        var bill=JSON.parse(temp);

        console.log(temp);
        var str=getTimeRndString();
        console.log(typeof str);
        bill.billId=str.toString();
        console.log("billId:"+bill.billId);

        bill.userEmail=req.session.uid;
        console.log(bill.userEmail);
        bill.urgentFee=null;
        bill.insuranceFee=null;
        bill.packFee=null;
        bill.sdate=null;
        bill.transportCost=null;
        bill.billstate="预约";
        var d = new Date();
        var nowTime = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()+" "+d.getHours()+":"+d.getMinutes();     //获取当前时间;
        bill.sdate=nowTime;

        var cmd='INSERT INTO waybill SET ?';
        pool.getConnection(function(err, connection){
            connection.query(cmd, bill, function(err, result) {
                console.log("$$$$$$$$$$$$$$$$$$$$$$$$"+JSON.stringify(bill));
                    if (err) {
                        console.log(err);
                        result={
                            code:500,
                            mes:"添加错误，请联系管理员！"
                        }
                        callback(result);
                        return 0;
                    }
                    result={
                        code:200,  
                        mes:"添加成功！"
                    }
                    callback(result);
                    connection.release();
            });
        }); 
    },
    queryHisBillsByDept: function(deptId, res, callback){
        var empcmd='SELECT * FROM waybill inner join employee on waybill.sdeliverId=employee.empId WHERE deptId=? and billState="签收" ';
        var netcmd='SELECT * FROM waybill left join network on waybill.netId=network.netId WHERE deptId=? and billState="签收" ';
        // var remind='SELECT * FROM waybill WHERE billstate="预约" '
        pool.getConnection(function(err, connection){
            connection.query(empcmd, deptId, function(err, empresult){
                if (err) {
                    console.log(err);
                    result={
                        code:500,
                        mes:"emp加载错误，请联系管理员！"
                    }
                    connection.release();
                    callback(result);
                }else{
                    connection.query(netcmd, deptId, function(err, netresult){
                        if (err) {
                            console.log(err);
                            result={
                                code:500,
                                mes:"net加载错误，请联系管理员！"
                            }
                            connection.release();
                            callback(result);
                        }else{
                            
                            billsresult={
                                code:200,
                                empdata:empresult,
                                netdata:netresult,
                                reminddata:null
                            }              
                            connection.release();      
                            callback(billsresult);
                        }
                    });
                }
            });
        });
    },

    queryUndispatchedBillsByDept: function(deptId, res, callback){
        var empcmd='SELECT * FROM waybill inner join employee on waybill.sdeliverId=employee.empId WHERE deptId=? and billState!="签收" ';
        var netcmd='SELECT * FROM waybill left join network on waybill.netId=network.netId WHERE deptId=? and billState!="签收" ';
        var remind='SELECT * FROM waybill WHERE billstate="预约" '
        pool.getConnection(function(err, connection){
            connection.query(empcmd, deptId, function(err, empresult){
                if (err) {
                    console.log(err);
                    result={
                        code:500,
                        mes:"emp加载错误，请联系管理员！"
                    }
                    connection.release();
                    callback(result);
                }else{
                    connection.query(netcmd, deptId, function(err, netresult){
                        if (err) {
                            console.log(err);
                            result={
                                code:500,
                                mes:"net加载错误，请联系管理员！"
                            }
                            connection.release();
                            callback(result);
                        }else{
                            connection.query(remind, function(err, rresult){
                                if (err) {
                                    console.log(err);
                                    result={
                                        code:500,
                                        mes:"remind加载错误，请联系管理员！"
                                    }
                                }else{
                                    billsresult={
                                    code:200,
                                    empdata:empresult,
                                    netdata:netresult,
                                    reminddata:rresult
                                }              
                                connection.release();      
                                callback(billsresult);
                                }
                            });
                        }
                        
                    });
                }
            });
        });
    },
    setBillSdeliver: function(req, res, callback){
        // var cmd="update waybill SET sdeliverId= "+req.body.empId+" where billId in "+ req.body.bills ;
        var cmd = "UPDATE `exp`.`waybill` SET `sdeliverId`= '"+req.body.empId+"' , `billState`='收件中' WHERE `billId`in "+ req.body.bills;

        // var cmd='update waybill SET sdeliverId=? WHERE billId=?';
        pool.getConnection(function(err, connection){
            connection.query(cmd,[], function(err,setresult){
                console.log(cmd);
                if (err) {
                    console.log(err);
                    result={
                        code:500,
                        meg:"更新错误，请联系管理员"
                    }

                }else{
                    result={
                        code:200,
                        meg:"操作成功"
                    }
                }
                connection.release();
                console.log(result);
                callback(result);   
            });
        });
    },  
    setSdeliverAndBillSatae: function(req, res, callback){
        var cmd = "UPDATE `exp`.`waybill` SET `sdeliverId`= '"+req.body.deliverId+"' , `billState`='收入' WHERE `billId`in "+ req.body.bills;
        pool.getConnection(function(err, connection){
            connection.query(cmd,[], function(err,setresult){
                console.log(cmd);
                if (err) {
                    console.log(err);
                    result={
                        code:500,
                        meg:"更新错误，请联系管理员"
                    }

                }else{
                    result={
                        code:200,
                        meg:"操作成功"
                    }
                }
                connection.release();
                console.log(result);
                callback(result);   
            });
        });
    },
    setBillsShipper: function(req, res, callback){
        var cmd = "UPDATE `exp`.`waybill` SET `cyId`= '"+req.body.cyId+"' , `billState`='已承运' WHERE `billId`in "+ req.body.bills;
        
        pool.getConnection(function(err, connection){
            connection.query(cmd,[], function(err,setresult){
                console.log(cmd);
                if (err) {
                    console.log(err);
                    result={
                        code:500,
                        meg:"更新错误，请联系管理员"
                    }

                }else{
                    result={
                        code:200,
                        meg:"操作成功"
                    }
                }
                connection.release();
                console.log(result);
                callback(result);   
            });
        });
    },
    setBillsForwarder: function(req, res, callback){
        var cmd = "UPDATE `exp`.`waybill` SET `forwarder`= '"+req.body.zyId+"' , `billState`='已转运' WHERE `billId`in "+ req.body.bills;
        
        pool.getConnection(function(err, connection){
            connection.query(cmd,[], function(err,setresult){
                console.log(cmd);
                if (err) {
                    console.log(err);
                    result={
                        code:500,
                        meg:"更新错误，请联系管理员"
                    }

                }else{
                    result={
                        code:200,
                        meg:"操作成功"
                    }
                }
                connection.release();
                console.log(result);
                callback(result);   
            });
        });
    },
    queryAppointBillByReaponseArea: function(responseArea, res, callback){
        var cmd="select * from waybill where cusAdd like '%"+responseArea+"%' and billState='预约' ";
        pool.getConnection(function(err, connection){
            connection.query(cmd, function(err, queryresult){
                console.log(cmd);
                if (err) {
                    console.log(err);
                    result={
                        code:500,
                        meg:"查询错误。"
                    }
                }else{
                    result={
                        code:200,
                        data:queryresult
                    }
                }
                connection.release();
                console.log(result);
                callback(result);
            });
        });
    },
    queryBillsByDeliverId: function(req, res, callback){
        var cmd="select * from waybill where sdeliverId="+req.session.uid+" and billState='"+req.query.billState+"'";
        pool.getConnection(function(err, connection){
            connection.query(cmd, function(err, queryresult){
                console.log(err);
                if (err) {
                    console.log(err);
                    result={
                        code:500,
                        meg:"查询错误。"
                    }
                }else{
                    result={
                        code:200,
                        data:queryresult
                    }
                }
                connection.release();
                console.log(result);
                callback(result);
            });
        });
    },

    queryBillsByString: function(req, res, callback){
        var cmd="select * from waybill where billId in "+req.query.bills;
        pool.getConnection(function(err, connection){
            connection.query(cmd, function(err, queryresult){
                console.log(err);
                console.log(cmd);
                if (err || queryresult.length==0) {
                    console.log(err);
                    result={
                        code:500,
                        meg:"查询错误。"
                    }
                }else{
                    result={
                        code:200,
                        data:queryresult
                    }
                }
                connection.release();
                console.log(result);
                callback(result);
            });
        });
    },

    queryAll: function (req, res, callback) {
        var cmd='select * from custom';
        pool.getConnection(function(err, connection) {
            connection.query(cmd, function(err, result) {
                connection.release();
                callback(result);
            });
        });
    }
};