var express = require('express');
var router = express.Router();
var dblink = require('../dao/dblink');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', {user: req.session, sysmsg: '' });
});

router.get('/hello', function(req, res, next) {
  	res.render('hello');
});

router.get('/test', function(req, res, next) {
  	res.render('test');
});

router.get('/test1', function(req, res, next) {
	dblink.customDao.queryAll(req, res, function(result){
		// res.render('layout', {layout:'customs', user: req.session,  subtitle: 'customs', customs: result });
		console.log("!!!!!!!!!!!!!!!!!!!!"+result);
  		res.render('test1', { CustomersData :result , user: req.session });
	});
});

/*查询快递*/
router.get('/expSearch', function(req, res, next) {
	res.render('layout', { layout: 'expSearch', user: req.session });
});

router.post('/expSearch', function(req, res, next) {
	dblink.shipperDao.queryByName(req, res, function(result){
		console.log(result);
		var exp={
			cyId:result.cyId,
			billId:req.body.billId
		}
		var result={};
		dblink.expDao.queryExpByBillIdAndCyId(exp, res, function(billres){
			if (billres.code==200) {
				result.code=200;
				result.sdate=billres.sdate;
				console.log(result.sdate);
				if (billres.netId) {
					dblink.netDao.queryById(billres.netId, res, function(netres){
						result.netName=netres.netName;
						console.log(result.netName);
						result.netAdd=netres.netAdd;
						console.log(result.netAdd);
						dblink.transDao.queryByBillId(billres.billId, res, function(transMes){
							if (transMes.code==200) {
								result.transMes=transMes;
								if (billres.fnetId) {
									dblink.netDao.queryById(billres.fnetId, res, function(netres){
										console.log("netres   dblink.employeeDao.empInfo");
										result.netName=netres.netName;
										result.netAdd=netres.netAdd;
										if (billres.signatory) {
											result.signatory=billres.signatory;
											res.json({data:result});
										}else{
											console.log(result);
											res.json({data:result});
										}
									});
								}else if (billres.fdeliverId) {
									dblink.employeeDao.empInfo(billres.fdeliverId, res, function(deliveres){
										console.log("deliveres   dblink.employeeDao.empInfo");
										result.fdeliverName=deliveres.empName;
										result.fPhone=deliveres.empPhone;
										if (billres.signatory) {
											result.signatory=billres.signatory;
											res.json({data:result});
										}else{
											console.log(result);
											res.json({data:result});
										}										
									});
								}else{
									console.log("result   dblink.transDao.queryByBillId");
									console.log(result);
									res.json({data:result});
								}
								
							}else{
								console.log("transMes code=500");
								console.log(result);
								res.json({data:result});
							}
							
						});
					});
				}
				if (billres.sdeliverId) {
					dblink.employeeDao.empInfo(billres.sdeliverId, res, function(deliveres){
						result.sdeliverName=deliveres.empName;
						dblink.transDao.queryByBillId(billres.billId, res, function(transMes){
							if (transMes.code==200) {
								result.transMes=transMes;
								if (billres.fnetId) {
									dblink.netDao.queryById(billres.fnetId, res, function(netres){
										console.log("netres   dblink.employeeDao.empInfo");
										result.netName=netres.netName;
										result.netAdd=netres.netAdd;
										if (billres.signatory) {
											result.signatory=billres.signatory;
											res.json({data:result});
										}else{
											console.log(result);
											res.json({data:result});
										}
									});
								}else if (billres.fdeliverId) {
									dblink.employeeDao.empInfo(billres.fdeliverId, res, function(deliveres){
										console.log("deliveres   dblink.employeeDao.empInfo");
										result.fdeliverName=deliveres.empName;
										result.fPhone=deliveres.empPhone;
										if (billres.signatory) {
											result.signatory=billres.signatory;
											res.json({data:result});
										}else{
											console.log(result);
											res.json({data:result});
										}										
									});
								}else{
									console.log("result   dblink.transDao.queryByBillId");
									console.log(result);
									res.json({data:result});
								}
								
							}else{
								console.log("transMes code=500");
								console.log(result);
								res.json({data:result});
							}
							
						});
						console.log("in   dblink.employeeDao.empInfo");
					});
					console.log("out    dblink.employeeDao.empInfo");
				}

			}else{
				result=billres;
				console.log("result   code=500");
				console.log(result);
				res.json({data: result});
			}
			
			
		});
	})
	
});

/*员工管理*/
router.get('/empManage', function(req, res, next){
	dblink.employeeDao.queryByDept(req, res, function(result){
		res.render('layout', {layout:'empManage', user: req.session,  subtitle: 'empManage', emps: result });
	})
});

router.get('/empManage/:job', function(req, res, next){
	dblink.employeeDao.queryByDept(req, res, function(result){
		res.render('layout', {layout:'empManage', user: req.session,  subtitle: 'empManage', emps: result });
	})
});

router.post('/deleteEmps', function(req, res, next){
	dblink.employeeDao.deleteEmps(req,res, function(result){
		dblink.employeeDao.queryByDept(req, res, function(result){
		res.render('layout', {layout:'empManage', user: req.session,  subtitle: 'empManage', emps: result, sysmsg: '删除成功' });
	});
	});
});

router.get('/addEmp', function(req, res, next) {
	res.render('layout', { layout: 'addEmp', user: req.session, subtitle: 'addEmp' });
});

router.post('/addEmp', function(req, res, next){
	dblink.employeeDao.addEmp(req, res, function(result){
		res.json({data: result});
	})
});

router.post('/emp/update', function(req, res, next){
	dblink.employeeDao.update(req, res, function(result){
		res.json({data: result});
	})
});



router.get('/emp/:empId', function(req, res, next) {
	dblink.employeeDao.empInfo( req.params.empId, res, function(result) {
		if (result.job=="司机") {
			dblink.employeeDao.driverInfo(req.params.empId, res, function(driver){
				res.render('layout', { 
					layout: 'emp', 
					subtitle: 'employee', 
					user: req.session, 
					emp: result, 
					driver: driver });
			})
		}
		else if (result.job=="快递员") {
			dblink.employeeDao.deliverInfo(req.params.empId, res, function(deliver){
				res.render('layout', { 
					layout: 'emp', 
					subtitle: 'employee', 
					user: req.session, 
					emp: result, 
					deliver: deliver });
			})
		}
		
		else
			res.render('layout', { layout: 'emp', subtitle: 'employee', user: req.session, emp: result });

	})
});



//经理管理业务
router.get('/bmanage', function(req, res, next) {
	dblink.shipperDao.queryAll(req, res, function(result){
		res.render('layout', { layout: 'bmanage', user: req.session, subtitle: 'bmanage', cys: result});
		})
});

router.get('/bmanage/:func', function(req, res, next){
	var func=req.params.func;

	console.log("&&&&&&&&&&&&&&^^^^^^^^^^^^^^^^^^^^^^");
	console.log(req.session.user);
	switch(func){
		case "承运商":
		dblink.shipperDao.queryAll(req, res, function(result){
		res.render('layout', { 
			layout: 'bmanage', 
			user: req.session, 
			subtitle: 'bmanage', 
			cys: result});
		});
		break;
		case "订单分派":
		dblink.shipperDao.queryAll(req, res, function(result){
			console.log("订单分派"+req.session);
		res.render('layout', { 
			layout: 'billDispatch', 
			user: req.session, 
			subtitle: 'billDispatch'
		});
		});
		break;
		case "运输线路":
		dblink.pathDao.queryAll(req, res, function(result){
		res.render('layout', { 
			layout: 'path', 
			user: req.session, 
			subtitle: 'path',
			lines: result
		});
		});
		break;
		case "财务报表":
		dblink.shipperDao.queryAll(req, res, function(result){
			console.log("*********************shipperDao");
		res.render('layout', { 
			layout: 'finacial', 
			user: req.session, 
			subtitle: 'finacial'
		});
		});
		break;
		case "转运商":
		dblink.forwarderDao.queryAll(req, res, function(result){
			console.log("*********************shipperDao");
		res.render('layout', { 
			layout: 'forwarder', 
			user: req.session.user, 
			subtitle: 'forwarder', 
			zys: result
		});
		});
		break;
		
		default: res.redirect('/bmanage');
			
	}

	
});

/*承运商管理*/
router.get('/cy/delete/:cyId', function(req, res, next){
	dblink.shipperDao.deleteCy(req.params.cyId,res, function(result){
		return res.redirect("/bmanage");
	});
});

router.get('/addcy', function(req, res, next) {
	res.render('layout', { layout: 'addcy', user: req.session, subtitle: 'addcy',title:"添加新的承运商", sysmsg: '' });
});

router.post('/addcy', function(req, res, next){
	console.log(req.body);
	var cy = {
					cyId : req.body.cyId,
					name : req.body.name,
					phone : req.body.phone,
					contactName:req.body.contactName,
					shipperAdd:req.body.shipperAdd,
				};
	dblink.shipperDao.addcy(cy, res, function(status){
		if (status == 1) {
			res.render('layout', {layout:'addcy', user: req.session,  subtitle: 'addcy',title:"添加新的承运商", sysmsg: '添加成功' });
		}
		else if (status==0){
			res.render('layout', {layout:'addcy', user: req.session,  subtitle: 'addcy',title:"添加新的承运商", sysmsg: '已存在，请更换编号。'});
		}
	})
});

router.post('/cy/update', function(req, res, next){
	dblink.shipperDao.update(req, res, function(status){
		if (status == 1) {
			res.render('layout', {layout:'cy', user: req.session,  subtitle: 'cy', cy: req.body, sysmsg: '修改成功' });
		}
		else {
			res.render('layout', {layout:'cy', user: req.session,  subtitle: 'cy', cy: req.body, sysmsg: '修改失败'});
		}
	})
});

router.get('/cy/:cyId', function(req, res, next) {
	dblink.shipperDao.queryCyById( req.params.cyId, res, function(result) {
		// res.json(result);
		res.render('layout', { layout: 'cy', subtitle: 'cy', user: req.session, cy: result, sysmsg: ''});
	});
});

/*转运商管理*/
router.get('/forwarder', function(req, res, next) {
	dblink.forwarderDao.queryAll(req, res, function(result){
			console.log("*********************shipperDao");
		res.render('layout', { 
			layout: 'forwarder', 
			user: req.session.user, 
			subtitle: 'forwarder', 
			zys: result
		});
	});
});

router.get('/zy/delete/:zyId', function(req, res, next){
	dblink.forwarderDao.deleteZy(req.params.zyId,res, function(result){
		return res.redirect("/forwarder");
	});
});

router.get('/addzy', function(req, res, next) {
	res.render('layout', { layout: 'addzy', user: req.session, subtitle: 'addzy', title:"添加新的转运商", sysmsg: '' });
});

router.post('/addzy', function(req, res, next){
	console.log(req.body);
	var zy = {
					zyId : req.body.zyId,
					name : req.body.name,
					phone : req.body.phone,
					contactName:req.body.contactName,
					shipperAdd:req.body.shipperAdd,
				};
	dblink.forwarderDao.addzy(zy, res, function(status){
		if (status == 1) {
			res.render('layout', {layout:'addzy', user: req.session,  subtitle: 'addzy',sysmsg: '添加成功' });
		}
		else if (status==0){
			res.render('layout', {layout:'addzy', user: req.session,  subtitle: 'addzy', sysmsg: '已存在，请更换编号。'});
		}
	})
});

router.post('/zy/update', function(req, res, next){
	dblink.forwarderDao.update(req, res, function(status){
		if (status == 1) {
			res.render('layout', {layout:'zy', user: req.session,  subtitle: 'zy', zy: req.body, sysmsg: '修改成功' });
		}
		else {
			res.render('layout', {layout:'zy', user: req.session,  subtitle: 'zy', zy: req.body, sysmsg: '修改失败'});
		}
	})
});

router.get('/zy/:zyId', function(req, res, next) {
	dblink.forwarderDao.queryZyById( req.params.zyId, res, function(result) {
		console.log(result);
		// res.render('layout', {layout:'netManage', user: req.session,  subtitle: 'netManage', nets: result });
		res.render('layout', { layout: 'zy', subtitle: 'zy', user: req.session , zy: result, sysmsg: ''});
	});
});

/*网点管理*/
router.get('/netManage', function(req, res, next){
	dblink.netDao.queryAll(req, res, function(result){
		res.render('layout', {layout:'netManage', user: req.session,  subtitle: 'netManage', nets: result });
	});
});

router.post('/nets', function(req, res, next) {
	dblink.netDao.queryAll(req, res, function(result){
		console.log(result);
		res.json({data: result});
	});
});

router.post('/nets/query', function(req, res, next) {
	console.log(req.body);
	dblink.netDao.queryByIdAndName(req, res, function(result){
		console.log(result);
		res.json({data: result});
	});
});

router.post('/nets/update', function(req, res, next){
	console.log(req.body);
	dblink.netDao.update(req, res, function(result){
		console.log(result);
		res.json({data: result});
	});
});

router.post('/nets/delete', function(req, res, next){
	console.log(req.body);
	dblink.netDao.delete(req, res, function(result){
		console.log(result);
		res.json({data: result});
	});
});

router.post('/nets/add', function(req, res, next){
	console.log(req.body);
	dblink.netDao.addnet(req, res, function(result){
		console.log(result);
		console.log('here/nets/add');
		res.json({data: result});
	});
});

/*客户管理*/
router.get('/customs', function(req, res, next){
	dblink.customDao.queryAll(req, res, function(result){
		res.render('layout', {layout:'customs', user: req.session,  subtitle: 'customs', customs: result });
	});
});


router.get('/customs/delete/:compId', function(req, res, next){
	dblink.customDao.deleteComp(req.params.compId,res, function(result){
		return res.redirect("/customs");
	});
});

router.post('/deleteComp', function(req, res, next){
	dblink.customDao.deleteComp(req, res, function(result){
		return res.redirect("/customs");
	});
});

router.get('/custom', function(req, res, next) {
	dblink.customDao.queryById(req, res, function(result){
		res.render('layout', { layout: 'custom', user: req.session, subtitle: 'custom', custom: result});
		});
});

router.get('/addcustom', function(req, res, next) {
	res.render('layout', { layout: 'addcustom', user: req.session, subtitle: 'addComp', sysmsg: '' });
});

router.post('/addcustom', function(req, res, next){
	var custom = {
					compId : req.body.compId,
					compName : req.body.compName,
					phoneNo : req.body.phoneNo,
					contactor : req.body.contactor,
					address : req.body.address,
					depositBank : req.body.depositBank,
					account : req.body.account,
					compType : req.body.compType,
				};		
	dblink.customDao.addComp(custom, res, function(status){
		if (status == 1) {
			res.render('layout', {layout:'addcustom', user: req.session,  subtitle: 'addcustom',sysmsg: '添加成功' });
		}
		else if (status==0){
			res.render('layout', {layout:'addcustom', user: req.session,  subtitle: 'addcustom', sysmsg: '已存在，请更换编号。'});
		}
	})
});

router.post('/customs/update', function(req, res, next){
	dblink.customDao.update(req, res, function(status){
		if (status == 1) {
			res.render('layout', {layout:'custom', user: req.session,  subtitle: 'custom', custom: req.body, sysmsg: '修改成功' });
		}
		else {
			res.render('layout', {layout:'custom', user: req.session,  subtitle: 'custom', custom: req.body, sysmsg: '修改失败'});
		}
	})
});

router.get('/customs/:compId', function(req, res, next) {
	dblink.customDao.queryById( req.params.compId, res, function(result) {
		// res.json(result);
		res.render('layout', { layout: 'custom', subtitle: 'custom', user: req.session, custom: result, sysmsg: ''});
	});
});

/*物资管理*/
router.get('/wareCar/:func', function(req, res, next){
	if (req.params.func==="ware") {
		dblink.wareCarDao.queryAllWare(req, res, function(result){
		res.render('layout', {layout:'ware', user: req.session,  subtitle: 'ware', wares: result, sysmsg: '' });
	});
	}else{
		res.render('layout', {layout:'car', user: req.session,  subtitle: 'car'});
	}
});

router.get('/ware/:warehId', function(req, res, next){
	console.log("*********************/ware/:warehId");
	console.log(req);
	dblink.wareCarDao.queryBywarehId(req.params.warehId, res, function(result){
		res.render('layout', {layout:'wareMeg', user: req.session,  subtitle: 'wareMeg' ,ware: result} );
	});
})

router.post('/addWare', function(req, res, next){
	console.log(req.body);
	dblink.wareCarDao.addWare(req, res, function(result){
		res.json({data:result});
	});
});

router.get('/goodsMeg', function(req, res, next){
	console.log(req.query);
	dblink.transDao.queryGoodsMegByWarehId(req.query.warehId, res, function(result){
		res.json(result);
	});
});

router.get('/wareHistory', function(req, res, next){
	dblink.transDao.querywareHistoryByWarehId(req.query.warehId, res, function(result){
		res.json(result);
	});
});

router.post('/outWare', function(req, res, next){
	console.log(req);
	dblink.transDao.setOutWareTime(req, res, function(result){
		res.json(result);
	});
});

router.post('/inWare', function(req, res, next){
	console.log(req);
	dblink.transDao.setOutWareTime(req, res, function(result){
		res.json(result);
	});
});

router.post('/updateInWareTime', function(req, res, next){
	console.log(req);
	dblink.transDao.updateInWareTime(req, res, function(result){
		res.json(result);
	});
});

router.post('/updateOutWareTime', function(req, res, next){
	console.log(req);
	dblink.transDao.updateOutWareTime(req, res, function(result){
		res.json(result);
	});
});

router.get('/queryGoodsByDate',function(req, res, next){
	console.log(req);
	dblink.transDao.queryGoodsByDate(req, res, function(result){
		res.json(result);
	});
});

/*车辆管理*/
router.post('/addCar', function(req, res, next){
	console.log(req.body);
	dblink.wareCarDao.addCar(req, res, function(result){
		res.json({data:result});
	});
});

router.post('/wareCar/deleteWare', function(req, res, next){
	dblink.wareCarDao.deleteWare(req, res, function(delresult){
		dblink.wareCarDao.queryAllWare(req, res, function(result){
			res.render('layout', {layout:'ware', user: req.session,  subtitle: 'ware', wares: result, sysmsg: delresult});
		});
	});
});

router.post('/wareCar/car', function(req, res, next){
	dblink.wareCarDao.queryAllCar(req, res, function(result){
		console.log("blink.wareCarDao.queryAllCar");
		res.json(result);
		// res.render('layout', {layout:'car', user: req.session,  subtitle: 'car', cars: result, sysmsg: '' });
	});
});

router.post('/car/queryByCarNo', function(req, res, next){
	dblink.wareCarDao.queryCarByNo(req, res, function(result){
		res.json(result);
	});
});

router.post('/car/queryByStatus', function(req, res, next){
	dblink.wareCarDao.queryByStatus(req, res, function(result){
		res.json(result);
	});
});

router.post('/updateCar', function(req, res, next){
	dblink.wareCarDao.updateCar(req, res, function(result){
		res.json(result);
	})
});

router.post('/car/delete', function(req, res, next){
	dblink.wareCarDao.deleteCar(req, res, function(result){
		res.json(result);
	});
});

/*billDispatch*/
router.get('/queryHisBillsByDept', function(req, res, next){
	console.log(req.session.deptId);
	dblink.billDao.queryHisBillsByDept(req.session.deptId, res, function(result){
		console.log(result);
		res.json(result);
	});
});

router.get('/queryUndispatchedBillsByDept', function(req, res, next){
	console.log(req.session.deptId);
	dblink.billDao.queryUndispatchedBillsByDept(req.session.deptId, res, function(result){
		console.log(result);
		res.json(result);
	});
});

router.post('/queryByDeptAndJob', function(req, res, next){
	console.log(req);
	dblink.employeeDao.queryByDept(req, res, function(result){
		console.log(result);
		res.json(result);
	});
});

router.post('/setBillSdeliver', function(req, res, next){
	console.log(req);
	dblink.billDao.setBillSdeliver(req, res, function(result){
		console.log(result);
		res.json(result);
	});
});

router.get('/queryShipper', function(req, res, next){
	console.log(req);
	dblink.shipperDao.queryAll(req, res, function(result){
		console.log(result);
		res.json(result);
	});
});

router.post('/setBillsShipper', function(req, res, next){
	dblink.billDao.setBillsShipper(req, res, function(result){
		console.log(result);
		res.json(result);
	});
});

router.post('/setBillsForwarder', function(req, res, next){
	dblink.billDao.setBillsForwarder(req, res, function(result){
		console.log(result);
		res.json(result);
	});
});

router.get('/queryForwarder', function(req, res, next){
	console.log("queryForwarder");
	dblink.forwarderDao.queryAll(req, res, function(result){
		console.log(result);
		res.json(result);
	});
});

router.get('/queryFreeCar', function(req, res, next){
	dblink.wareCarDao.queryFreeCar(req, res, function(result){
		console.log(result);
		res.json(result);
	});
});

router.get('/queryFreeDriver', function(req, res, next){
	dblink.employeeDao.queryFreeDriver(req, res, function(result){
		console.log(result);
		res.json(result);
	});
});

router.get('/distribute', function(req, res, next){
	console.log("*****************************************************");
	console.log(req.query.bills);
	res.render('layout', { layout:'distribute', user:req.session })
});

router.get('/queryBillsByString', function(req, res, next){
	// console.log(req);
	dblink.billDao.queryBillsByString(req, res, function(result){
		res.json(result);
	});
});

router.post('/submitFreight', function(req, res, next){
	console.log(req);
	dblink.freightDao.addFreight(req, res, function(result){
		console.log(result);
	});
	// dblink.billDao.setBillsFreightId(req, res, function(result){

	// });
});

/* User Information control */
router.get('/userInfo', function(req, res, next){
	console.log(req.session.user );
	res.render('layout', { layout: 'userInfo', subtitle: 'userInfo', user: req.session, userInfo: req.session.user });
});

router.post('/userInfo/update', function(req, res, next){
	console.log("###############################");
	dblink.userDao.update(req, res, function(status){
		if (status == 1) {
			res.render('layout', {layout:'userInfo', user: req.session,  subtitle: 'userInfo', userInfo: req.body, sysmsg: '修改成功' });
		}
		else {
			res.render('layout', {layout:'userInfo', user: req.session,  subtitle: 'userInfo', userInfo: req.body, sysmsg: '修改失败'});
		}
	})
});

/*登录登出模块*/
router.get('/login', function(req, res, next) {
	res.render('login', {user: req.session, sysmsg: '' });
});

router.post('/login', function(req, res, next) {
	// var role=req.body.role;
	var user = {
		lgn : req.body.lgn,
		pwd : req.body.pwd,
		job : req.body.job
	};
	if (req.body.job=="网点") {
		console.log("#####$$$$$$$%%%%%%%%%%网点");
		dblink.netDao.login(user, req.session, function(status){
			if (status == 1) {
				// res.render('index',{title: '物流管理系统' });
				res.render('layout', { layout: 'index', user: req.session, title: 'Express网点' });
			}
			else {
				// res.redirect('/login');
				res.render('login', { user: req.session, sysmsg: '账号或密码错误！'});
			}
		})
	}
	if (req.body.job=="客户") {
		console.log("#####$$$$$$$%%%%%%%%%%客户");
		dblink.userDao.login(user, req.session, function(status){
			if (status == 1) {
				res.render('layout', { layout: 'index', user: req.session, title: 'Express客户' });
			}
			else {
				res.render('login', { user: req.session, sysmsg: '账号或密码错误！'});
			}
		})
	}
	else {
		console.log("#####$$$$$$$%%%%%%%%%%else");
		dblink.employeeDao.login(user, req.session, function(status){
			if (status == 1) {
				// res.render('index',{title: '物流管理系统' });
				res.render('layout', { layout: 'index', user: req.session, title: 'Express' });
			}
			else {
				// res.redirect('/login');
				res.render('login', { user: req.session, sysmsg: '账号或密码错误！'});
			}
		});
	};
});

router.get('/logout', function(req, res, next) {
	req.session.regenerate(function(err) {
		res.redirect('/');
	});
});

module.exports = router;
