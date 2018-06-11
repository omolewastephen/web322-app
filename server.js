/*********************************************************************************
 * WEB322 – Assignment 03
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

const dataService = require('./data-service.js');
const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });



app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));



app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + '/views/home.html'));
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname + '/views/about.html'));
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
        res.json(data);
    }).catch(function(err) {
        var error = { "message": err };
        res.json(error);
    });
});

app.get("/employees", (req, res) => {
    if (req.query.department) {
        return dataService.getEmployeesByDepartment(req.query.department).then(
            data => res.json(data)
        );
    } else if (req.query.status) {
        return dataService.getEmployeesByStatus(req.query.status).then(
            data => res.json(data)
        );
    } else if (req.query.manager) {
        return dataService.getEmployeesByManager(req.query.manager).then(
            data => res.json(data)
        );
    } else {
        return dataService.getAllEmployees().then(
            data => res.json(data)
        );
    }
});

app.get('/employees/add', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/addEmployee.html'));
});

app.get('/employees/:value', (req, res) => {
    var num = req.params.value;
    dataService.getEmployeeByNum(num).then(function(data) {
        res.json(data);
    }).catch(function(err) {
        console.log(err);
    });
});

app.get('/images/add', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/addImage.html'));
})

app.get("", (req, res) => {
    res.sendFile(path.join(__dirname + '/views/404.html'));
});

app.post('/images/add', upload.single("imageFile"), (req, res) => {
    res.redirect('/images');
});

app.get("/images", (req, res) => {
    var path = "public/images/uploaded/";
    var images = "";
    fs.readdir(path, function(err, items) {
        images = items;
        res.json({ images });
    });
});

app.post('/employees/add', (req, res) => {
    dataService.addEmployee(req.body).then(function() {
        res.redirect('/employees');
    }).catch(function(err) {
        res.json(err);
    });
});

dataService.initialize().then(function() {
    app.listen(HTTP_PORT, () => console.log('Express http server listening on port ' + HTTP_PORT));
}).catch(function(err) {
    console.log('Error initializing app. No data found');
});