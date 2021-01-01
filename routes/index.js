var express = require('express'),
    path = require('path'),
    router = express.Router(),
    MySQLLib = require('../db/js/mysqlLib'),
    jwt = require('jsonwebtoken'),
    bcrypt = require('bcrypt'),
    bodyParser = require('body-parser'),
    { isAuthenticated } = require('../middleware/authenicator');


router.use(bodyParser.json());    
/**
 * Request for homepage
 */
router.get('/', (req, res) => {
    // Get a connection to the DB and get the required information for the frontend functions
    MySQLLib.getConnection((err, conn)=>{
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


// Login
router.post('/login', (req, res) => {
    // Get the login information
    console.log(req);
    MySQLLib.query("SELECT * from users where username=?", req.body.username)
        .then(result => {
            console.log(result);
            if ( result.length > 1){
                throw Error('Error: multiple users with the same username!');
            }
            bcrypt.compare(req.body.password, result[0].upass, function(err, same){
                if (err) throw err;
                else if (same) {
                    res.json({status: 1, res: 'Success'});
                    // Add the authenticated user to the cookie with a ticket
                    req.session.authenticated = true;
                    req.session.username = req.body.username;
                    req.session.save(function(err){
                        if (err) throw err;
                    })
                } else {
                    res.json({status: 0, res: 'Wrong Username or password!'});
                }
            });
        })
        .catch(err=>{
            console.error(err);
            res.json({res: 'Internal Server Error!'});
        });
});

router.get('/dashboard', isAuthenticated, (req, res) => {
    res.send(`You made it ${req.session.username}`);
});


module.exports = router;