const { rejects } = require('assert');
const { get } = require('https');
const { resolve } = require('path');

var express = require('express'),
    path = require('path'),
    router = express.Router(),
    MySQLLib = require('../db/js/mysqlLib'),
    jwt = require('jsonwebtoken'),
    bcrypt = require('bcrypt'),
    bodyParser = require('body-parser'),
    { isAuthenticated } = require('../middleware/authenicator');

function getPriorities(){
    return new Promise((resolve, reject) =>  {
        MySQLLib.query('SELECT * FROM priority')
        .then(results =>  {
            let elements = []
            
            for (let result of results){
                elements.push({id: result.priorityid, name: result.name});
            }
            // Sort by IDs
            elements.sort((a,b) =>{
                return a.id - b.id;
            });
            resolve(elements);
        })
        .catch(err => rejects(err));
    }); 
}

router.use(bodyParser.json());    
/**
 * Request for homepage
 */
router.get('/', (req, res) => {
    // Get a connection to the DB and get the required information for the frontend functions
    getPriorities()
        .then(result => {
            res.render('index', {renderable: result, scripts: ['https://cdn.jsdelivr.net/npm/chart.js@2.8.0','/js/frontendAPI.js']});
        })
        .catch(err=> {
            console.error(err);
            res.status(500).send("ERROR!");
        });
});

// Render the login page
router.get('/login', (req, res) => {
    getPriorities()
        .then(result => {
            res.render('login', {renderable: result, scripts: ['/js/login.js']});
        })
        .catch(err => {

        })
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
    Promise.all([
        getPriorities(),
        MySQLLib.query("select ulevel from users where username=?", req.session.username)
    ])
        .then(results => {
            res.render('dashboard', {renderable: results[0], user: req.session.username, userLevel: results[1][0].ulevel, scripts: ['/js/dashboard.js', '/js/handler.js']});
        })
        .catch(err => {
            console.error(err);
            res.redirect('/');
        })
    
});


module.exports = router;