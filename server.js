// Importing packages
const  https = require('https'),
       http = require('http'), 
       fs = require('fs'),
       expressLayouts = require('express-ejs-layouts'),
       express = require('express'),
       session = require('express-session'),
       MySQLStore = require('express-mysql-session')(session),
       mysqlLib = require('./mysqlLib');

// Creating app instance 
var app = express();
// Body Parser
app.use(express.urlencoded({ extended: false }));

// Start the SQL store
var sessionStore = new MySQLStore(mysqlLib.storeOptions);
app.use(session({
    key: '69Atu22GZTSyDGW4sf4mMJdJ42436gAs',
    secret: '3dCE84rey8R8pHKrVRedgyEjhrqGT5Hz',
    store: sessionStore,
    rolling: true,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60000
    }
}));
// Setting static parameters
app.use(express.static('public'));

// EJS startup
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Creating port number
const HTTPPORT = 8080;
const HTTPSPORT = 8443;

app.use('/', require('./routes/index'));
app.use('/DBApi', require('./routes/DBApi'));

// Not useful. Need these in apache
const options = {
    key: fs.readFileSync('C://tools/openssl-1.1/ssl/certs/RootCA.key'),
    cert: fs.readFileSync('C://tools/openssl-1.1/ssl/certs/RootCA.crt')
};
// Starting the http server.
var httpsServer = https.createServer(options, app);
httpsServer.listen(HTTPSPORT, function() {
    console.log(`Listening on port ${HTTPSPORT}`);
});