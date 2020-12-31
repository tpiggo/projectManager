var express = require('express'),
    path = require('path'),
    router = express.Router(),
    mysqlLib = require('../mysqlLib'),
    jwt = require('jsonwebtoken'),
    bcrypt = require('bcrypt');

/**
 * Request for homepage
 */
router.get('/', (req, res) => {
    // Get a connection to the DB and get the required information for the frontend functions
    mysqlLib.getConnection((err, conn)=>{
        // Connection is a Pool type but I can't get the pool type to be returned
        conn.query(`SELECT * FROM priority`, (err, results) =>{
            if (err) throw err;
            let elements = []
            
            for (let result of results){
                elements.push({id: result.priorityid, name: result.name});
            }
            // Sort by IDs
            elements.sort((a,b) =>{
                return a.id - b.id;
            });
            console.log(elements, results);
            return res.render('index', {renderable: elements});
        });
    })
});

// Render the login page
router.get('/login', (req, res) => {
    res.render('login');
});

module.exports = router;