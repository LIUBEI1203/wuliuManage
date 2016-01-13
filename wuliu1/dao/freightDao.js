var mysql=require('mysql');
var $conf = require('../conf/db.js');
var pool=mysql.createPool($conf.mysql);

module.exports={
    addFreight: function(req, res, callBack){
        var cmd='insert into freight set ? ';
        var params = req.body;
        var empString=params.data[empId];
        var emps=empString.split(';');
        var empid1=emps[0];
        var empid2=null;
        var empid3=null;
        if (emps[1]) {empid2=emps[1];};
        if (emps[2]) {empid3=emps[2];};
        console.log(emps);
        console.log(params.data[carId]);
        pool.getConnection(function(err, connection){
            connection.query(cmd, [params.data[carId], params.data.empId], function(err, result){
                if (err) {
                    console.log(err);
                    result={
                        code:500,
                        meg:"添加运输信息错误！"
                    }
                }else{
                    result={
                        code:200,
                        meg:"添加运输信息成功！"
                    }
                }
                connection.release();
                callBack(result);
            });
        });
    },
    setEndateByFreightId: function(req, res, callBack){
        var cmd='update freight set endate=? ';
        pool.getConnection(function(err, connection){
            connection.query(cmd, [], function(err, result){
                if (err) {
                    console.log(err);
                    result={
                        code:500,
                        meg:"更新到达时间错误！"
                    }
                }else{
                    result={
                        code:200,
                        meg:"更新到达时间成功！"
                    }
                }
                connection.release();
                callBack(result);
            });
        });
    }
};