var authenticator = {}
const { Request, Response } = require('express');
/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 * @param {Function} next 
 */
authenticator.isAuthenticated = (req, res, next)=>{
    if (req.session.authenticated){
        return next()
    }
    console.log(req.session, req.session.authenticated, req.session.username);
    res.send("<h1>No Access</h1>");
}

module.exports = authenticator;