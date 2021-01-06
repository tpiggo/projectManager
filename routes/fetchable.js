const express = require('express');
const { asyncIsAuth } = require('../middleware/authenicator');
var router = express.Router(),
    fs = require('fs'),
    path = require('path'),
    MySQLLib = require('../db/js/mysqlLib');

// This is a request handler. No data transactions take place here.

router.get('/Creator', asyncIsAuth, (req, res) => {
    try {
            
        fs.readFile(path.join(__dirname, "../views/creator.html"), {encoding: "utf8"}, (err, data) => {
            if (err) throw (err);
            res.json({html: data, scripts: [{pathToScript: '/js/editor.js', onload: 'editorOnLoad'}]});
        });
    } catch(err) {
        res.status(500).json({response: "Error reading file!"});
    }
});

module.exports = router;