/*********************************************************************************
 * WEB322 – Assignment 05
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
 * of this assignment has been copied manually or electronically from any other source 
 * (including 3rd party web sites) or distributed to other students.
 * 
 * Name: ______________________ Student ID: ______________ Date: ________________
 *
 * Online (Heroku) Link: ________________________________________________________
 *
 ********************************************************************************/
var HTTP_PORT = process.env.PORT || 8080;
var express = require('express');
var app = express();
var path = require("path");
var multer = require('multer');
var fs = require('fs');
var bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const dataService = require('./data-service.js');

app.engine('.hbs', exphbs({
    extname: '.hbs',
    helpers: {
        navLink: function(url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        toJSON: function(object) {
            return JSON.stringify(object);
        },
        defaultLayout: 'main'
    }
}));

app.set('view engine', '.hbs');


const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });



app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

app.use(express.static('public'));



app.get("/", (req, res) => {
    res.render('home', { layout: 'main' });
});

app.get("/about", (req, res) => {
    res.render("about", { layout: 'main' });
});

app.get("/managers", (req, res) => {
    dataService.getManagers().then(function(data) {
        const managers = [];
        data.forEach((element) => {
            if (element.isManager == true) {
                managers.push(element);
            }
        });
        res.json(managers);
    }).catch(function(err) {
        var error = { "message": err };
        res.json(error);
    });
});

app.get("/departments", (req, res) => {
    dataService.getDepartments().then(function(data) {
        if (data.length > 0) {
            res.render('departments', { layout: 'main', departments: data });
        } else {
            res.render('departments', { layout: 'main', message: 'no result' });
        }

    }).catch(function(err) {
        // var error = { "message": err };
        res.render('departments', { layout: 'main', message: 'no result' });
    });
});

app.get("/departments/add", (req, res) => {
    res.render('addDepartment', { layout: 'main' });
});

app.get("/employees", (req, res) => {
    if (req.query.department) {
        return dataService.getEmployeesByDepartment(req.query.department).then(
            data => res.render("employees", { layout: 'main', employees: data })
        ).catch(() => {
            res.render("employees", { layout: 'main', message: 'no result' })
        });
    } else if (req.query.status) {
        return dataService.getEmployeesByStatus(req.query.status).then(
            data => res.render("employees", { layout: 'main', employees: data })
        ).catch(() => {
            res.render("employees", { layout: 'main', message: 'no result' })
        });
    } else if (req.query.manager) {
        return dataService.getEmployeesByManager(req.query.manager).then(
            data => res.render("employees", { layout: 'main', employees: data })
        ).catch(() => {
            res.render("employees", { layout: 'main', message: 'no result' })
        });
    } else {
        return dataService.getAllEmployees().then(
            function(data) {
                if (data.length > 0) {
                    res.render("employees", { layout: 'main', employees: data })
                } else {
                    res.render("employees", { layout: 'main', message: 'no result' })
                }
            }
        ).catch(() => {
            res.render("employees", { layout: 'main', message: 'no result' })
        });
    }
});

app.get('/employees/add', (req, res) => {
    dataService.getDepartments().then((data) => {
        res.render('addEmployee', { layout: 'main', departments: data });
    }).catch(() => {
        res.render("addEmployee", { layout: 'main', departments: [] });
    })
});

app.get('/employee/:value', (req, res) => {
    let viewData = {};
    dataService.getEmployeeByNum(req.params.value).then((data) => {
        if (data) {
            viewData.employee = data;
        } else {
            viewData.employee = null;
        }
    }).catch(() => {
        viewData.employee = null;
    }).then(dataService.getDepartments).then((data) => {
        viewData.departments = data;
        for (let i = 0; i < viewData.departments.length; i++) {
            if (viewData.departments[i].departmentId == viewData.employee.department) {
                viewData.departments[i].selected = true;
            }
        }
    }).catch((err) => {
        console.log(err);
        viewData.departments = [];
    }).then(() => {
        if (viewData.employee == null) {
            res.status(404).send("Employee not found");
        } else {
            res.render("employee", { layout: 'main', viewData: viewData })
        }
    })
});

app.get('/department/:value', (req, res) => {
    var id = req.params.value;
    dataService.getDepartmentById(id).then(function(data) {
        if (data === "undefined") {
            res.status(404).send("Department Not Found");
        } else {
            res.render("department", { layout: 'main', department: data });
            console.log(data);
        }

    }).catch(function(err) {
        // res.render("department", { layout: 'main', message: "no results" });
        res.status(404).send("Department Not Found");
    });
});

app.post('/employee/update', (req, res) => {
    dataService.updateEmployee(req.body).then(function(data) {
        res.redirect("/employees");
    }).catch((err) => {
        console.log(err);
    });
});

app.post('/department/update', (req, res) => {
    console.log(req.body);
    dataService.updateDepartment(req.body).then(function(data) {
        console.log(req.body);
        res.redirect("/departments");
    }).catch((err) => {
        console.log(err);
    });
});

app.get('/images/add', (req, res) => {
    res.render("addImage", { layout: 'main' });
});


app.post('/images/add', upload.single("imageFile"), (req, res) => {
    res.redirect('/images');
});

app.get("/images", (req, res) => {
    var path = "public/images/uploaded/";
    var images = "";
    fs.readdir(path, function(err, items) {
        images = items;
        res.render("images", { layout: 'main', images: images });
    });
});

app.post('/employees/add', (req, res) => {
    dataService.addEmployee(req.body).then(function() {
        res.redirect('/employees');
    }).catch(function(err) {
        res.json(err);
    });
});

app.post('/departments/add', (req, res) => {
    dataService.addDepartment(req.body).then(function() {
        res.redirect('/departments');
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

app.get("/employees/delete/:empNum", (req, res) => {
    var empNum = req.params.empNum;
    dataService.deleteEmployeeByNum(empNum).then(() => {
        res.redirect("/employees");
    }).catch((err) => {
        res.status(500).send("Unable to Remove Employee / Employee not found");
    })
});

app.use(function(req, res) {
    res.status(400);
    res.render('404', { layout: 'main' });
});


dataService.initialize().then(function() {
    app.listen(HTTP_PORT, () => console.log('Express http server listening on port ' + HTTP_PORT));
}).catch(function(err) {
    console.log('Error initializing app. No data found');
});