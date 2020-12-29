const express = require('express');
var router = express.Router(),
    mysql = require('mysql'),
    mysqlLib = require('../mysqlLib');


/**
 * @description Building where query given a type and id.
 * @param {String} type 
 * @param {Number} id 
 */
function whereQueryGivenID(table, type, id=-1){
    let whereClause = id < 0?"":`${type}id=${id}`
    return `SELECT * FROM ${table} WHERE ` + whereClause;
}

/**
 * @description Creates a new Promise for asynchronous interaction.
 * @param {String} query
 * @returns {Promise} 
 */
function getFromDB(query){
    return new Promise((resolve, reject) =>{
        mysqlLib.getConnection((err, conn)=>{
            if (err) reject(err);
            conn.query(query, (err, result) =>{
                // Release the connection. Wihtout it, we stall after 3 threads...
                conn.release();
                if (err) reject(err);
                else resolve(result);
            });
        });
    });
}

/**
 * @description Concatenates strings in an array, using an or as a delim rather than comma 
 * @param {Array} strings
 */
String.prototype.concatFormattedOr = function (strings){
    if (strings.length <= 0){
        throw Error('String array is not long enough')
    }
    if (strings.length < 2){
        return this.valueOf() + strings[0];
    }
    let rString = '';
    for (let i =0; i < strings.length-1; i++){
        rString += strings[i] + ' OR ';
    }
    return this.valueOf() + rString + strings[strings.length-1];
}

/**
 * @description Formats a response from the DB
 * @param {Array} listElements 
 * @param {String} cType 
 * @param {String} nType
 */
function formattedResponseFromDB(listElements, cType, nType){
    let cTypeId = `${cType}id`, formattedQuery = [], outerArr=[];
    for (let result of listElements){
        outerArr.push({id: result[cTypeId], name: result.name, type: cType});
        formattedQuery.push(`${cTypeId}=${result[cTypeId]}`);
    }
    let query = `SELECT * FROM ${nType} WHERE `;
    query = query.concatFormattedOr(formattedQuery);
    return {query: query, returnable: outerArr};
}
/**
 * Testing the connection with simple DB access
 */
router.get('/test-connection', (req, res) =>{
    /**
     * @description Testing the db connection and output being arabic!
     */
    mysqlLib.getConnection((err, client) =>{
        if (err) throw err;
        client.query('SELECT * FROM testtable', (err, response) =>{
            if (err) throw err;
            console.log('Successful query');
            console.log(response);
            let rArr = [];
            for (let element of response) {
                rArr.push(element.descrp);
            }
            console.log(rArr);
            res.json({response: 'Successful call BABY', db: rArr});
        });
    });
});

/**
 * Accessor for priority information, given id
 */
router.get('/get-priority', (req, res) =>{
    // Query contains the information for the strategy
    /**
     * @todo Handle errors 
     */
    let sql = whereQueryGivenID('direction', 'priority', req.query.priorityid);
    let directions = [];
    console.log('Demand for priority\n', sql);
    getFromDB(sql)
        .then(results =>{
            // Create a new clause which get the objectives then projects in general
            let ret = formattedResponseFromDB(results, 'direction' , 'objective');
            directions = ret.returnable;
            sql = ret.query;
            // Get the next the objectives
            console.log('Done First', sql);
            return getFromDB(sql);
        })
        .then(results=>{
            /**
             * Get the project information. This information will allow for the breakdown information on the
             * page. 
             */ 
            let ret = formattedResponseFromDB(results, 'objective' , 'project');
            sql = ret.query;
            // Don't need the outer Array.
            console.log('Done Second', sql);
            return getFromDB(sql);
        })
        .then(results =>{
            // console.log('Projects', results);
            // console.log('Directions:', directions);
            /**
             * @todo: Use the projects and return the proper information 
             */
            console.log('Done Third');
            // From here we can find the information about each project and the rest of the renderable information
            res.json({response: "Got projects. Returning."});
            console.log('Done');
        })
        .catch(err=>{
            console.error('Error',err);
            res.status(500).json({response: "Internal server error!"});
        });
});

/**
 * Route for getting the projects from the priority
 */
router.get('/get-priority', (req, res) =>{
    /**
     * @todo Handle errors 
     */
})

/**
 * Accessor for direction information, given id
 */
router.get('/get-direction', (req, res) =>{
    /**
     * @todo Handle errors 
     */
    let sql = whereQueryGivenID('objective', 'direction', req.query.directionid);
    let objectives = [];
    getFromDB(sql)
        .then(results =>{
            let formatted = formattedResponseFromDB(results, 'objective', 'project');
            objectives = formatted.returnable;
            sql = formatted.query;
            console.log('Done First', sql);
            return getFromDB(sql);
        })
        .then(results =>{
            /**
             * @todo: Use the projects and return the proper information 
             */
            console.log('Proper execution',results);
            res.json({response: "Functioned properly"});
        })
        .catch(err=>{
            console.error('Error',err);
            res.status(500).json({response: "Internal server error!"});
        })
});

/**
 * Route for getting the projects from the objective
 */
router.get('/get-direction-projects', (req, res) =>{
    /**
     * @todo Handle errors 
     */
})
/**
 * Accessor for objective information, given id
 */
router.get('/get-objective', (req, res)=>{
    /**
     * @todo Handle errors 
     */
    let sql = whereQueryGivenID('project', 'objective', req.query.objectiveid);
    getFromDB(sql)
        .then(results =>{
            // Need only to get one level of depth since we are simply looking at objective information
            console.log('Proper execution', results);
            /**
             * @todo: Parse the projects
             */
            res.json({response: 'Objectives worked'});
        })
        .catch(err=>{
            console.error('Error',err);
            res.status(500).json({response: "Internal server error!"});
        });
});

/**
 * Route for getting the projects from the objective
 */
router.get('/get-objective-projects', (req, res)=>{
    /**
     * @todo Handle errors 
     */
    let projects = [];
    getFromDB(whereQueryGivenID('project', 'project', req.query.objectiveid))
        .then(results =>{
            for( let i = 0; i < results.length; i++){
                let project = {};
                Object.keys(results[i]).forEach((key) =>{
                    console.log(key);
                    project[key] = result.key;
                });
                /**
                 * @todo Get the rest of the project information
                 */
                projects.push(project);
                res.json({response: 'Objective Projects Response'});
            }

        })
        .catch(err => {
            console.error(err);
            // Create Error
            res.status(500).json({response: 'Internal Server Error'});
        })
})
/**
 * Project accessor for mulitple or singular project
 */
router.get('/get-project', (req, res) =>{
    // Either getting a type of project or a specific projects 
    // One of the following will be undefined, if multiple are defined, error!
    /**
     * @todo Handle errors 
     */
    if (req.query.length > 1){
        // Requesting too much data from the projects. No answer.
        res.status(400).json({
            response: 'Bad request. Too many argmuents!',
            accepts: 'See documentation'
        });
    } else {
        let project = {}
        getFromDB(whereQueryGivenID('project', 'project', req.query.projectid))
            .then(results =>{
                // Must travel back up the objective tree to get the priority and direction, there is only one in the list
                if (results.length < 1){
                    return Promise.reject("Error: Did not find a match!");
                }
                Object.keys(results[0]).forEach((key) =>{
                    console.log(key);
                    project[key] = result.key;
                });
                /**
                 * @todo Get the rest of the project information
                 */
                res.json({response: 'Project Response'});
            })
            .catch(err=>{
                console.error(err);
                // Create Error
                res.status(500).json({response: 'Internal Server Error'});
            })
    }

});

module.exports = router;