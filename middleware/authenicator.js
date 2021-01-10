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
    res.status(500).send("No Access");
}


authenticator.asyncIsAuth = (req, res, next)=>{
    if (req.session.authenticated){
        return next();
    }
    console.log(req.session, req.session.authenticated, req.session.username);
    res.status(400).json({error: 'No Access!'});
}
module.exports = authenticator;