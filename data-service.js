var employees = [];
var departments = [];
var managers = [];

const fs = require('fs');


function initialize() {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/employees.json', (err, data) => {
            if (err) {
                reject(err);
            } else {
                try {
                    employees = JSON.parse(data);
                    resolve(employees);
                } catch (err) {
                    reject('Unable to read file');
                }
            }
        });
        fs.readFile('./data/departments.json', (err, data) => {
            if (err) {
                reject(err);
            } else {
                try {
                    departments = JSON.parse(data);
                    resolve(departments);
                } catch (err) {
                    reject('Unable to read file');
                }
            }
        });
    });
};

function getAllEmployees() {
    return new Promise((resolve, reject) => {
        try {
            resolve(employees);
        } catch (error) {
            reject("no result returned");
        }
    });
};

function getManagers() {
    return new Promise((resolve, reject) => {
        try {
            resolve(employees);
        } catch (error) {
            reject("no result returned");
        }
    });
};

function getDepartments() {
    return new Promise((resolve, reject) => {
        try {
            resolve(departments);
        } catch (error) {
            reject("no result returned");
        }
    });
}

function addEmployee(employeeData) {
    return new Promise((resolve, reject) => {
        try {
            if (!employeeData.isManager) {
                employeeData.isManager = "false";
            } else {
                employeeData.isManager = "true";
            }

            employeeData.employeeNum = employeeData.length + 1;
            employees.push(employeeData);

            resolve(employees);

        } catch (error) {
            reject("no result returned");
        }
    });
}

function getEmployeesByStatus(status) {
    return new Promise((resolve, reject) => {
        try {
            const empStatus = [];
            employees.forEach((element) => {
                if (element.status == status) {
                    empStatus.push(element);
                }
            });
            resolve(empStatus);
        } catch (error) {
            reject("no data returned");
        }
    });
}

function getEmployeesByDepartment(department) {
    return new Promise((resolve, reject) => {
        try {
            const dept = [];
            employees.forEach((element) => {
                if (element.department == department) {
                    dept.push(element);
                }
            });

            resolve(dept);
        } catch (error) {
            reject("no data returned");
        }
    });
}

function getEmployeesByManager(manager) {
    return new Promise((resolve, reject) => {
        try {
            const managers = [];
            employees.forEach((element) => {
                if (element.employeeManagerNum == manager) {
                    managers.push(element);
                }
            });

            resolve(managers);
        } catch (error) {
            reject("no data returned");
        }
    });
}

function getEmployeeByNum(num) {
    return new Promise((resolve, reject) => {
        try {
            employees.forEach((element) => {
                if (element.employeeNum == num) {
                    resolve(element);
                }
            });
        } catch (error) {
            reject("no data returned");
        }
    });
}

module.exports = {
    getDepartments: getDepartments,
    getManagers: getManagers,
    getAllEmployees: getAllEmployees,
    initialize: initialize,
    addEmployee: addEmployee,
    getEmployeesByStatus: getEmployeesByStatus,
    getEmployeeByNum: getEmployeeByNum,
    getEmployeesByManager: getEmployeesByManager,
    getEmployeesByDepartment: getEmployeesByDepartment
}