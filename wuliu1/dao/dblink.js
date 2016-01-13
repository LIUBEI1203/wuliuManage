var mysql=require('mysql'),
	crypto = require('crypto');


var employeeDao=require('./employeeDao');
	expDao=require('./expDao');
	shipperDao=require('./shipperDao');
	pathDao=require('./pathDao');
	customDao=require('./customDao');
	wareCarDao=require('./wareCarDao');
	billDao=require('./billDao');
	netDao=require('./netDao');
	transDao=require('./transDao');
	userDao=require('./userDao');
	forwarderDao=require('./forwarderDao');
	freightDao=require('./freightDao');

module.exports={
	employeeDao:employeeDao,
	expDao:expDao,
	shipperDao:shipperDao,
	pathDao:pathDao,
	customDao:customDao,
	wareCarDao:wareCarDao,
	billDao:billDao,
	netDao:netDao,
	transDao:transDao,
	userDao:userDao,
	forwarderDao:forwarderDao,
	freightDao:freightDao
}