var sqlite3 = require('sqlite3').verbose();
var bcrypt = require('bcryptjs');
module.exports = {};

const DB_FILE = 'users.db';
const TABLE_CREATION_SQL = "CREATE TABLE if not exists user_info (" +
    "id INTEGER PRIMARY KEY NOT NULL," +
    "username TEXT NOT NULL UNIQUE," +
    "password TEXT NOT NULL)";

module.exports.initializeTable = function () {
    createDbConnection(function (db) {
        db.run(TABLE_CREATION_SQL);
    });
};

module.exports.addUser = function (username, password, callback) {
    encryptPassword(password, function (err, encryptedPassword) {
        createDbConnection(function (db) {
            db.run("INSERT INTO user_info VALUES (NULL, ?, ?)", [username, encryptedPassword]);
            db.all("SELECT * FROM user_info WHERE username=?", username,
                function (err, rows) {
                    callback(err, (rows.length != 0) ? rows[0] : false);
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

module.exports.getUserById = function (id, callback) {
    createDbConnection(function (db) {
        db.all("SELECT * FROM user_info WHERE id=?", [id],
            function (err, rows) {
                callback(err, (rows.length != 0) ? rows[0] : false);
            });
    })
};

module.exports.getUserList = function (callback) {
    createDbConnection(function (db) {
        db.all("SELECT * FROM user_info", callback);
    });
};

function createDbConnection(callback) {
    var db = new sqlite3.Database(DB_FILE);
    db.serialize(function () {
        callback(db);
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