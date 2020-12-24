// Importing packages
const  http = require('http'),
       fs = require('fs'),
       jwt = require('jsonwebtoken'),
       expressLayouts = require('express-ejs-layouts'),
       express = require('express');

// Creating app instance 
var app = express();

// Body Parser
app.use(express.urlencoded({ extended: false }));

// Setting static parameters
app.use(express.static('public'));

// EJS startup
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Creating port number
const PORT = process.env.PORT || 5000;

app.use('/', require('./routes/index'));

// Starting the http server server. Create an HTTPS server !!!
var server = http.createServer(app);
server.listen(PORT, function() {
    console.log(`Listening on port ${PORT}`);
});