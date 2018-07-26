const Sequelize = require("sequelize");

var sequelize = new Sequelize("d2ts1novnse099", "gcndwvonokrmto", "a68bdfadecbc19dbd67947644a6bed15f92a7fcc72ce9c4a4d0074bd83faebd1", {
    host: "ec2-54-227-240-7.compute-1.amazonaws.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
        ssl: true
    }
});

var Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING
}, {
    createdAt: false,
    updatedAt: false
});

var Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
}, {
    createdAt: false, // disable createdAt
    updatedAt: false // disable updatedAt
});

function initialize() {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            Employee.create().then(function(employee) {
                resolve();
            }).catch(() => {
                reject("Unabale to sync the database");
            });

            Department.create().then(function(department) {
                resolve();
            }).catch(() => {
                reject("Unabale to sync the database");
            });
        });
    });
};

function getAllEmployees() {
    return new Promise((resolve, reject) => {
        Employee.findAll().then((data) => {
            resolve(data);
        }).catch(() => {
            reject("Unabale to sync database");
        });
    });
};

function getManagers() {
    return new Promise((resolve, reject) => {
        reject();
    });
};

function getDepartments() {
    return new Promise((resolve, reject) => {
        Department.findAll().then((data) => {
            resolve(data);
        }).catch(() => {
            reject("No result returned");
        });
    });
}

function addEmployee(employeeData) {
    return new Promise((resolve, reject) => {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for (const prop in employeeData) {
            if (employeeData[prop] == "") {
                employeeData[prop] = null;
            }
        };
        Employee.create(employeeData).then(() => {
            resolve();
        }).catch(() => {
            reject("unable to create employee");
        })

    });
}

function addDepartment(departmentData) {
    return new Promise((resolve, reject) => {
        for (const prop in departmentData) {
            if (departmentData[prop] == "") {
                departmentData[prop] = null;
            }
        };
        Department.create(departmentData).then(() => {
            resolve();
        }).catch((err) => {
            reject(err);
        })

    });
}

function getEmployeesByStatus(status) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where: {
                status: status
            }
        }).then((data) => {
            resolve(data);
        }).catch(() => {
            reject("No result returned");
        });
    });
}

function getEmployeesByDepartment(department) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where: {
                department: department
            }
        }).then((data) => {
            resolve(data);
        }).catch(() => {
            reject("No result returned");
        });
    });
}

function getEmployeesByManager(manager) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where: {
                employeeManagerNum: manager
            }
        }).then((data) => {
            resolve(data);
        }).catch(() => {
            reject("No result returned");
        });
    });
}

function getEmployeeByNum(num) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where: {
                employeeNum: num
            }
        }).then((data) => {
            resolve(data[0]);
        }).catch(() => {
            reject("No result returned");
        });
    });
}

function getDepartmentById(id) {
    return new Promise((resolve, reject) => {
        Department.findAll({
            where: {
                departmentId: id
            }
        }).then((data) => {
            resolve(data[0]);
        }).catch(() => {
            reject("No result returned");
        });
    });
}

function updateEmployee(employeeData) {
    return new Promise((resolve, reject) => {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for (const prop in employeeData) {
            if (employeeData[prop] == "") {
                employeeData[prop] = null;
            }
        };
        Employee.update({ employeeData }, {
            where: {
                employeeNum: employeeData.employeeNum
            }
        }).then(() => {
            resolve();
        }).catch((err) => {
            reject(err);
        })
    });
}

function updateDepartment(departmentData) {
    return new Promise((resolve, reject) => {
        for (const prop in departmentData) {
            if (departmentData[prop] == "") {
                departmentData[prop] = null;
            }
        };
        Department.update(departmentData, {
            where: {
                departmentId: departmentData.departmentId
            }
        }).then(() => {
            resolve();
        }).catch((err) => {
            reject("unable to update employee");
        })
    });
}

function deleteEmployeeByNum(empNum) {
    return new Promise((resolve, reject) => {
        Employee.destroy({
            where: {
                employeeNum: empNum
            }
        }).then(() => {
            resolve();
        }).catch(() => {
            reject("destroyed");
        });
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
    getEmployeesByDepartment: getEmployeesByDepartment,
    updateEmployee: updateEmployee,
    addDepartment: addDepartment,
    updateDepartment: updateDepartment,
    getDepartmentById: getDepartmentById,
    deleteEmployeeByNum: deleteEmployeeByNum
}