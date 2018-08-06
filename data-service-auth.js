var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

var userSchema = new Schema({
    "userName": {
        "type": String,
        "unique": true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
        "dateTime": Date,
        "userAgent": String
    }]
});

let User;

module.exports.initialize = function() {
    return new Promise(function(resolve, reject) {
        let db = mongoose.createConnection("mongodb://Lewa:11toMtom.@ds213612.mlab.com:13612/web322_a6");
        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = function(userData) {
    return new Promise(function(resolve, reject) {
        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
        }

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(userData.password, salt, (err, hash) => {
                userData.password = hash;

                let newUser = new User(userData);
                newUser.save((err) => {
                    if (err && err.code === 11000) {
                        reject('User Name already taken');
                    } else if (err && err.code !== 11000) {
                        reject("There was an error creating the user:" + err);
                    } else {
                        resolve();
                    }
                });
            });

        });

    })
}

module.exports.checkUser = function(userData) {
    return new Promise(function(resolve, reject) {
        User.find({ userName: userData.userName }).then((users) => {
            if (!users) {
                reject("Unable to find user:" + userData.userName);
            } else {
                bcrypt.compare(userData.password, users[0].password).then((res) => {
                    if (res === true) {
                        // resolve();
                        users[0].loginHistory.push({
                            dateTime: (new Date()).toString(),
                            userAgent: userData.userAgent
                        });

                        User.update({ userName: users[0].userName }, { $set: { loginHistory: users[0].loginHistory } }).exec().then(() => {
                            resolve(users[0]);
                        }).catch((err) => {
                            reject("There was an error verifying the user:" + err);
                        });

                    } else if (res === false) {
                        reject("Unable to find user:" + userData.userName);
                    }
                });
            }
        }).catch((err) => {
            reject("Unable to find user:" + userData.userName + "- " + err);
        })
    })
}