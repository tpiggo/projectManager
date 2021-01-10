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
 * @param {(err: Error, connection: mysql.PoolConnection)} callback
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
 * @returns {Promise<Array>}
 */
exports.query = function(query, input=null){
    return new Promise((resolve, reject) =>{
        pool.getConnection((err, conn)=>{
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

function getFields(tablename){
    return new Promise((resolve, reject) => {
        this.query(`show columns from ${tablename}`)
            .then(result => {
                let fields = [];
                result.forEach(value => {
                    fields.push(value.Field);
                });
                resolve(fields);
            })
            .catch(err => reject(err));
    });
}

/**
 * 
 * @param {String} query 
 * @param {Array<String>} insertables 
 */
exports.insert = function (query, insertables) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, conn) =>{
            if (err){
                console.log('error1');
                return reject(err);
            };
            conn.beginTransaction((err)=>{
                if (err) {
                    console.log('error2: rolling back');
                    return reject(err);
                }
                conn.query(query, insertables, (err, result) => {
                    if (err) {
                        return conn.rollback((error)=>{
                            if (error){ 
                                console.log('error3: rolling back');
                                return reject(error);
                            }
                            console.log('error4: rolling back');
                            reject(err);
                        });
                    }
                    conn.commit((err) =>{
                        if (err) {
                            return conn.rollback((error)=>{
                                if (error){ 
                                console.log('error5: rolling back');
                                    return reject(error);
                                }
                                console.log('error6: rolling back');
                                reject(err);
                            });   
                        }
                        conn.release();
                        resolve(result);
                    });
                });
            });
        })
    });
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

