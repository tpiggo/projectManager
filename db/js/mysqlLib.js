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

/**
 * @description Creates a new Promise for asynchronous interaction.
 * @param {String} query
 */
exports.query = function(query, input=null){
    return new Promise((resolve, reject) =>{
        this.getConnection((err, conn)=>{
            if (err) reject(err);
            if (input == null){
                conn.query(query, (err, result) =>{
                    // Release the connection. Wihtout it, we stall after 3 threads...
                    conn.release();
                    if (err) reject(err);
                    else resolve(result);
                });
            } else {
                conn.query(query, input,(err, result) =>{
                    // Release the connection. Wihtout it, we stall after 3 threads...
                    conn.release();
                    if (err) reject(err);
                    else resolve(result);
                });
            }
        });
    });
}

/**
 * The tables are statically bound. 
 */
exports.accessableTables =   {
    budgetbreakdown: 'budgetbreakdown',
    company: 'company',
    department: 'department',
    direction: 'direction',
    milestone: 'milestone',
    objective: 'objective',
    priority: 'priority',
    project: 'project',
    projectkpi: 'projectkpi',
    projectstrategickpi: 'projectstrategickpi',
    projecttype: 'projecttype',
    stakeholder: 'stakeholder',
    strategickpi: 'strategickpi',
    supporter: 'supporter',
    users: 'users'
  }

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

