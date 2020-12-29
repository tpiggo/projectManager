var mysql = require('mysql');
/**
 * Connection to the MySQL DB
 * Single accessor script for all DB interactions. Keeping it all in one manageable place
 */
let poolOptions = {
    connectionLimit: 100,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'projectdb'
}

var pool = mysql.createPool(poolOptions);

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


exports.storeOptions  = {
    host: 'localhost',
    user: "root",
    password: '',
    database: 'projectdb',
    endConnectionOnClose: true,
    clearExpired: true,
    checkExpirationInterval: 30000,
	charset: 'utf8mb4_bin',
	schema: {
		tableName: 'sessions',
		columnNames: {
			session_id: 'session_id',
			expires: 'expires',
			data: 'data'
		}
	}
}

