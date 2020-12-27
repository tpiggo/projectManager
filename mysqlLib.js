var mysql = require('mysql');
/**
 * Connection to the MySQL DB
 * Single accessor script for all DB interactions. Keeping it all in one manageable place
 */
var pool = mysql.createPool({
    host: "localhost",
    user: 'root',
    password: '',
    database: 'projectdb'
});

/**
 * retrieve a connection and execute a callback function on the DB connection
 * @param {Function} callback
 */
exports.getConnection = function (callback){
    pool.getConnection((err, connection)=>{
        if (err) return callback(err);
        // Execute callback
        callback(err, connection);
    });
};