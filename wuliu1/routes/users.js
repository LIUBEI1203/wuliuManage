var express = require('express');
var router = express.Router();

var dblink=require('../dao/dblink');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/*快递员网点功能模块*/

// 录单

router.get('/billrecord', function(req, res, next){

	res.render('layout', { layout: 'billrecord', user: req.session, sysmsg: "" });
});
// 添加订单
router.post('/addBill', function(req, res, next){
    dblink.billDao.addBill(req, res, function(result){
        res.json({data:result});
    })
});
// 添加预约订单
router.get('/addAppoint', function(req, res, next){
    res.render('layout', { layout: 'appoint', user: req.session, sysmsg: "" });
});

router.post('/addAppoint', function(req, res, next){
    dblink.billDao.addAppoint(req, res, function(result){
        res.json({data:result});
    })
});

router.get('/customs', function(req, res, next){
    dblink.customDao.queryAll(req, res, function(result){
        res.json( { data: result });
    });
});

router.get('/cys', function(req, res, next){
    dblink.shipperDao.queryAll(req, res, function(result){
        res.json( { data: result });
    });
});

// 快递员收单
router.get('/checkDuty', function(req, res, next){
    dblink.employeeDao.queryDeliverMegByEmpId(req.session.uid, res, function(result){
        console.log(result);
        res.render('layout', { layout: 'checkDuty', user: req.session, deliver: result});
    });
});

router.get('/appointMeg', function(req, res, next){
    console.log("appointMeg");
    console.log(req);
    dblink.billDao.queryBillsByDeliverId(req, res, function(result){
        res.json(result);
    });
});

router.get('/areaDuty', function(req, res, next){
    console.log("areaDuty:"+req.query.responseArea);
    console.log(req);
    dblink.billDao.queryAppointBillByReaponseArea(req.query.responArea, res, function(result){
        res.json(result);
    });
});

router.post('/sdeliverComplete', function(req, res, next){
    console.log(req);
    dblink.billDao.setSdeliverAndBillSatae(req, res, function(result){
        res.json(result);
    });
});

// // 增加员工
// router.get('/addEmp', function(req, res, next) {
// 	dblink.employeeDao.add(req, res, next);
// });

// //查询员工
// router.get('/queryEmpById', function(req,res,next){
// 	dblink.employeeDao.queryById(req, res, next);
// })



module.exports = router;
