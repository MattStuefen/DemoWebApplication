var bcrypt = require('bcryptjs');
var crypto = require("crypto");
var dbConnection = require('./sqliteHelper');

module.exports = {};

const TABLE_CREATION_SQL = "CREATE TABLE if not exists user_info (" +
    "id INTEGER PRIMARY KEY NOT NULL," +
    "username TEXT NOT NULL UNIQUE," +
    "password TEXT NOT NULL," +
    "email TEXT UNIQUE," +
    "role INTEGER NOT NULL," +
    "org_admin_id INTEGER," +
    "reset_token TEXT UNIQUE)";

const USER_ROLES = {MASTER_ADMIN: 0, ADMIN: 1, USER: 2};

module.exports.initializeTable = function () {
    dbConnection.initialize('users.db');
    dbConnection.run(TABLE_CREATION_SQL);
};

module.exports.addUser = function (username, password, emailAddress, org_admin, callback) {
    encryptPassword(password, function (err, encryptedPassword) {
        dbConnection.run("INSERT INTO user_info VALUES (NULL, ?, ?, ?, ?, ?, NULL)", [username, encryptedPassword, emailAddress, (org_admin ? USER_ROLES.USER : USER_ROLES.ADMIN), (org_admin ? org_admin.id : null)],
            function (err) {
                if (err) return callback(getFailureString(err));
                getUserByField("username", username, callback);
            });
    });
};

module.exports.removeUser = function (id, callback) {
    dbConnection.run("DELETE FROM user_info WHERE id=? OR org_admin_id=?", [id, id], callback);
};

module.exports.verifyUser = function (username, password, callback) {
    dbConnection.findOne("SELECT * FROM user_info WHERE username=?", [username],
        function (err, userInfo) {
            if (err || !userInfo) return callback(err, userInfo);
            comparePassword(password, userInfo.password, function (err, isMatch) {
                if (isMatch) {
                    clearResetToken(username, function (resetErr) {
                        return callback(err, userInfo);
                    });
                } else {
                    return callback(err, false);
                }
            });
        });
};

module.exports.changePassword = function (update_data, callback) {
    if ((update_data['token'] == 'undefined') && !update_data['user']) return callback("Error: User not specified.");
    var identifyingField = (update_data['token'] != 'undefined') ? 'reset_token' : 'username';
    var identifyingValue = (update_data['token'] != 'undefined') ? update_data['token'] : update_data['user'].username;

    encryptPassword(update_data['password'], function (err, encryptedPassword) {
        if (err) return callback(err);
        updateUserInfo('password', encryptedPassword, identifyingField, identifyingValue, callback);
    });
};

module.exports.editUser = function (userInfo, callback) {
    updateUserInfo('username', userInfo.username, 'id', userInfo.id, function (err) {
        if (err) return callback(err);
        updateUserInfo('email', userInfo.emailAddress, 'id', userInfo.id, callback)
    })
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

module.exports.getUserList = function (user, callback) {
    if(user.role == 0){
        dbConnection.all("SELECT * FROM user_info", null, callback);
    } else {
        dbConnection.all("SELECT * FROM user_info WHERE org_admin_id=?", [user.id], callback);
    }
};

module.exports.isAdmin = function (user){
    return user && (user.role == USER_ROLES.MASTER_ADMIN || user.role == USER_ROLES.ADMIN);
};

function getFailureString(err) {
    // Todo: Add more cases - and ideally these cases wouldn't be SQLite specific
    switch (err.message) {
        case "SQLITE_CONSTRAINT: UNIQUE constraint failed: user_info.username":
            return "Username already exists.";
        case "SQLITE_CONSTRAINT: UNIQUE constraint failed: user_info.email":
            return "Email address already linked to an account.";
        default:
            return err;
    }
}

function updateUserInfo(updateField, updateValue, identifyingField, identifyingValue, callback) {
    getUserByField(identifyingField, identifyingValue, function (err, user) {
        if (err) return callback(err);
        if (!user) return callback("ERROR: Specified user does not exist.");

        dbConnection.run("UPDATE user_info SET " + updateField + "=? WHERE " + identifyingField + "=?", [updateValue, identifyingValue], callback);
    });
}

function getUserByField(field, value, callback) {
    dbConnection.findOne("SELECT * FROM user_info WHERE " + field + "=?", [value], callback);
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

function clearResetToken(username, callback) {
    dbConnection.run("UPDATE user_info SET reset_token = NULL WHERE username=?", [username], callback);
}