// dao/employeeSqlMapping.js
// CRUD SQL语句
var employee = {
	// insert:'INSERT INTO employee(empId, deptId,empPassword,empName, entryDate,job,gender) VALUES(0,?,?,?,?,?,?)',
	insert:'INSERT INTO employee(empId, empPassword,empName) VALUES(?,?,?)',
	// update:'update employee set empEntryDate=?,job=?, deptId=?,empPassword=?, empBirth=?,empPhone=? where empId=?',
	update:'update employee set empPassword=?, empPhone=? ,entryDate=?, empBirth=?, job=?, deptId=? ,empName=?,entryDate=?,gender=?,account=?,eduDegree=?,depositbank2=?,empqq=?,email=?,school=?,home=?,marital=?,creditid=?,ethnic=?,political=? where empId=?',
	deleteById: 'delete from employee where empId=?',
	updatePassword:'update employee set empPassword=? where empId=? ',
	empInfo: 'select * from employee where empId=? ',
	queryByName:'select * from employee where empName=?',
	queryBydeptId:'select * from employee where deptId=?',
	queryAll: 'select * from employee'
};
 
module.exports = employee;