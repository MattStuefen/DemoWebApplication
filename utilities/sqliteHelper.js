var sqlite3 = require('sqlite3').verbose();

module.exports = {};

module.exports.initialize = function(dbFile){
    module.exports.DB_FILE = dbFile;
};

module.exports.createDbConnection = function (callback) {
    var db = new sqlite3.Database(module.exports.DB_FILE);
    db.serialize(function () {
        return callback(db);
    });
    db.close();
};

module.exports.run = function (sql, inputs, callback) {
    module.exports.createDbConnection(function (db) {
        db.run(sql, inputs, callback);
    });
};

module.exports.all = function (sql, inputs, callback) {
    module.exports.createDbConnection(function (db) {
        if (inputs) {
            db.all(sql, inputs, callback);
        } else {
            db.all(sql, callback);
        }
    });
};

module.exports.findOne = function (sql, inputs, callback) {
    module.exports.all(sql, inputs, function (err, rows) {
        return callback(err, (rows.length == 0) ? false : rows[0]);
    });
};
