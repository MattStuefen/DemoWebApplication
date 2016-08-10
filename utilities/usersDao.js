var sqlite3 = require('sqlite3').verbose();
var bcrypt = require('bcryptjs');
var crypto = require("crypto");
module.exports = {};

const DB_FILE = 'users.db';
const TABLE_CREATION_SQL = "CREATE TABLE if not exists user_info (" +
    "id INTEGER PRIMARY KEY NOT NULL," +
    "username TEXT NOT NULL UNIQUE," +
    "password TEXT NOT NULL," +
    "email TEXT UNIQUE," +
    "reset_token TEXT UNIQUE)";

module.exports.initializeTable = function () {
    createDbConnection(function (db) {
        db.run(TABLE_CREATION_SQL);
    });
};

function getFailureString(err) {
    switch(err.message){
        case "SQLITE_CONSTRAINT: UNIQUE constraint failed: user_info.username":
            return "Username already exists.";
        case "SQLITE_CONSTRAINT: UNIQUE constraint failed: user_info.email":
            return "Email address already linked to an account.";
        default:
            return err;
    }
}
module.exports.addUser = function (username, password, emailAddress, callback) {
    encryptPassword(password, function (err, encryptedPassword) {
        createDbConnection(function (db) {
            db.run("INSERT INTO user_info VALUES (NULL, ?, ?, ?, NULL)", [username, encryptedPassword, emailAddress],
                function (err) {
                    if (err) return callback(getFailureString(err));
                    getUserByField("username", username, callback);
                });
        });
    });
};

module.exports.removeUser = function (id, callback) {
    createDbConnection(function (db) {
        db.run("DELETE FROM user_info WHERE id=?", [id], callback);
    })
};

module.exports.verifyUser = function (username, password, callback) {
    createDbConnection(function (db) {
        db.all("SELECT * FROM user_info WHERE username=?", [username],
            function (err, rows) {
                if (err || (rows.length == 0)) return callback(err, false);
                comparePassword(password, rows[0].password, function (err, isMatch) {
                    return callback(err, isMatch ? rows[0] : false);
                });
            });
    });
};

module.exports.changePassword = function (update_data, callback){
    if((update_data['token'] == 'undefined') && !update_data['user']) return callback("Error: User not specified.");
    var identifyingField = (update_data['token'] != 'undefined') ? 'reset_token' : 'username';
    var identifyingValue = (update_data['token'] != 'undefined') ? update_data['token'] : update_data['user'].username;

    encryptPassword(update_data['password'], function (err, encryptedPassword) {
        if (err) return callback(err);
        updateUserInfo('password', encryptedPassword, identifyingField, identifyingValue, callback);
    });
};

module.exports.generateResetToken = function (emailAddress, callback) {
    crypto.randomBytes(25, function (err, tokenBuffer) {
        var token = tokenBuffer.toString('hex');

        updateUserInfo('reset_token', token, 'email', emailAddress, function (err) {
            return callback(err, token);
        });
    });
};

module.exports.getUserById = function (id, callback) {
    getUserByField("id", id, callback);
};

module.exports.getUserList = function (callback) {
    createDbConnection(function (db) {
        db.all("SELECT * FROM user_info", callback);
    });
};

function updateUserInfo(updateField, updateValue, identifyingField, identifyingValue, callback) {
    getUserByField(identifyingField, identifyingValue, function (err, user) {
        if (err) return callback(err);
        if (!user) return callback("ERROR: Specified user does not exist.");

        createDbConnection(function (db) {
            db.run("UPDATE user_info SET " + updateField + "=? WHERE " + identifyingField + "=?", [updateValue, identifyingValue], callback);
        });
    });
}

function getUserByField(field, value, callback) {
    createDbConnection(function (db) {
        db.all("SELECT * FROM user_info WHERE " + field + "=?", [value],
            function (err, rows) {
                if (err) return callback(err);
                return callback(err, (rows.length != 0) ? rows[0] : false);
            });
    });
}

function createDbConnection(callback) {
    var db = new sqlite3.Database(DB_FILE);
    db.serialize(function () {
        return callback(db);
    });
    db.close();
}

function encryptPassword(password, callback) {
    bcrypt.genSalt(12, function (err, salt) {
        if (err) return callback(err);

        bcrypt.hash(password, salt, function (err, hash) {
            return callback(err, hash);
        });
    });
}

function comparePassword(password, encryptedPassword, callback) {
    bcrypt.compare(password, encryptedPassword, callback);
}
