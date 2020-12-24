const express = require('express'),
    path = require('path');
var router = express.Router();

/**
 * Request for homepage
 */
router.get('/', (req, res) => {
    res.render('index');
});


module.exports = router;