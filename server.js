var HTTP_PORT = process.env.PORT || 8080;
var express = require('express');
var app = express();
var path = require("path");
var multer = require('multer');
var fs = require('fs');
var bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const dataService = require('./data-service.js');
const dataServiceAuth = require('./data-service-auth');
const clientSessions = require("client-sessions");

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

app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "web322_app_assignment_number_6", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}

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

app.get("/departments", ensureLogin, (req, res) => {
    dataService.getDepartments().then(function(data) {
        if (data.length > 0) {
            res.render('departments', { layout: 'main', departments: data });
        } else {
            res.render('departments', { layout: 'main', message: 'no result' });
        }

    }).catch(function(err) {
        res.render('departments', { layout: 'main', message: 'no result' });
    });
});

app.get("/departments/add", ensureLogin, (req, res) => {
    res.render('addDepartment', { layout: 'main' });
});

app.get("/employees", ensureLogin, (req, res) => {
    if (req.query.department) {
        return dataService.getEmployeesByDepartment(req.query.department).then(
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
    } else if (req.query.status) {
        return dataService.getEmployeesByStatus(req.query.status).then(
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
    } else if (req.query.manager) {
        return dataService.getEmployeesByManager(req.query.manager).then(
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

app.get('/employees/add', ensureLogin, (req, res) => {
    dataService.getDepartments().then((data) => {
        res.render('addEmployee', { layout: 'main', departments: data });
    }).catch(() => {
        res.render("addEmployee", { layout: 'main', departments: [] });
    })
});

app.get('/employee/:value', ensureLogin, (req, res) => {
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

app.get('/department/:value', ensureLogin, (req, res) => {
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

app.post('/employee/update', ensureLogin, (req, res) => {
    console.log(req.body);
    dataService.updateEmployee(req.body).then(function() {
        res.redirect("/employees");
    }).catch((err) => {
        console.log(err);
    });
});

app.post('/department/update', ensureLogin, (req, res) => {
    dataService.updateDepartment(req.body).then(function(data) {
        res.redirect("/departments");
    }).catch((err) => {
        console.log(err);
    });
});

app.get('/images/add', ensureLogin, (req, res) => {
    res.render("addImage", { layout: 'main' });
});


app.post('/images/add', ensureLogin, upload.single("imageFile"), (req, res) => {
    res.redirect('/images');
});

app.get("/images", ensureLogin, (req, res) => {
    var path = "public/images/uploaded/";
    var images = "";
    fs.readdir(path, function(err, items) {
        images = items;
        res.render("images", { layout: 'main', images: images });
    });
});

app.post('/employees/add', ensureLogin, (req, res) => {
    dataService.addEmployee(req.body).then(function() {
        res.redirect('/employees');
    }).catch(function(err) {
        res.json(err);
    });
});

app.post('/departments/add', ensureLogin, (req, res) => {
    dataService.addDepartment(req.body).then(function() {
        res.redirect('/departments');
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

app.get("/employees/delete/:empNum", ensureLogin, (req, res) => {
    var empNum = req.params.empNum;
    dataService.deleteEmployeeByNum(empNum).then(() => {
        res.redirect("/employees");
    }).catch((err) => {
        res.status(500).send("Unable to Remove Employee / Employee not found");
    })
});

app.get("/login", (req, res) => {
    res.render('login', { layout: "main" });
});

app.get("/register", (req, res) => {
    res.render('register', { layout: "main" });
});

app.post("/register", (req, res) => {
    dataServiceAuth.registerUser(req.body).then(() => {
        res.render('register', { layout: "main", successMessage: "User created" });
    }).catch(() => {
        res.render('register', { layout: "main", errorMessage: err, userName: req.body.userName });
    })
});

app.post('/login', (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    dataServiceAuth.checkUser(req.body).then((user) => {
        req.session.user = {
            userName: user.userName, // authenticated user's userName
            email: user.email, // authenticated user's email
            loginHistory: user.loginHistory // authenticated user's loginHistory
        }
        res.redirect('/employees');
    }).catch((err) => {
        res.render('login', { layout: "main", errorMessage: err, userName: req.body.userName });
        console.log(err);
    })
});

app.get("/logout", function(req, res) {
    req.session.reset();
    res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
    res.render("userHistory", { layout: "main" });
});

app.use(function(req, res) {
    res.status(400);
    res.render('404', { layout: 'main' });
});


dataService.initialize().then(dataServiceAuth.initialize).then(function() {
    app.listen(HTTP_PORT, () => console.log('Express http server listening on port ' + HTTP_PORT));
}).catch(function(err) {
    console.log('Error initializing app. No data found' + err);
});