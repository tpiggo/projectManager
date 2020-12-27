const express = require('express');
var router = express.Router(),
    mysqlLib = require('../mysqlLib');

/**
 * Testing the connection with simple DB access
 */
router.get('/test-connection', (req, res) =>{
    mysqlLib.getConnection((err, client) =>{
        if (err) throw err;
        client.query('SELECT * FROM objective', (err, response) =>{
            if (err) throw err;
            console.log('Successful query');
            console.log(response);
            res.json({'Response': 'Successful call BABY'});
        });
    });
});


module.exports = router;