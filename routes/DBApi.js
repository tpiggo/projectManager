const express = require('express');
var router = express.Router(),
    mysql = require('mysql'),
    MySQLLib = require('../MySQLLib'),
    bcrypt = require('bcrypt');


var tables = MySQLLib.accessableTables;   

/**
 * @description Building where query given a type and id. Not safe or user input
 * @param {String} table 
 * @param {String} type 
 * @param {Number} id 
 */
function whereID(table, type, id=-1){
    let whereClause = id < 0?"":`${type}id=${id}`
    return `SELECT * FROM ${table} WHERE ` + whereClause;
}

/**
 * @description Building where query given a type and id. Safe for user input
 * @param {String} table 
 * @param {String} type 
 */
function whereIDEscaped(table, type){
    return `SELECT * FROM ${table} WHERE ${type}id=?`
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


// Defining the list of queries, reducing duplicate code!
/**
 * @description Creating a owner query. SQL safe, this is not an SQL injection
 * @param {String} insertable 
 */
function getOwnerQuery(insertable){
    return `select 
    count(*) as numprojects, 
    dep.name as name, 
    dep.departmentid as id 
    from project p 
    left join department dep on p.owner = dep.departmentid 
    where p.objectiveid in (
        ${insertable}
    ) group by id;`   
}
/**
 * @description Creating a Stakeholder query. SQL safe, this is not an SQL injection
 * @param {String} insertable 
 */
function getStakeHolderQuery(insertable){
    return `select
    s.companyid,
    s.departmentid,
    count(*) as numproj,
    case when s.departmentid is not null then d.name else c.name end as name
    from stakeholder s 
    left join department d on s.departmentid = d.departmentid
    left join company c on s.companyid = c.companyid
    where s.projectid in (
        ${insertable}
    )
    group by s.companyid , s.departmentid;`
}
/**
 * @description Creating a supporter query. SQL safe, this is not an SQL injection
 * @param {String} insertable 
 */
function getSupportersQuery(insertable){
    return `
    select
    s.departmentid as supporterid,
    count(*) as numprojects ,
    d.name as name 
    from supporter s 
    left join department d on s.departmentid = d.departmentid 
    where s.projectid in (
    ${insertable} 
    ) group by s.departmentid;`;
}

function groupProjectInformation(projectIDinsert,objInsert, genericListQuery,id){
    return new Promise((resolve, reject)=>{
        // inner list is either directions or objectives!
        let innerList = [], supporters = [], dStake = [], cStake = [], owners = [];
        let sql = getOwnerQuery(objInsert);
        MySQLLib.query(sql, [id])
        .then(results => {
            results.forEach(value=>{
                owners.push({id: value.id, numproj: value.numprojects, name: value.name})
            });
            sql= genericListQuery;
            return MySQLLib.query(sql, [id])
        })
        .then(results => {
            // Save the directions, shed extra information (unneeded)
            results.forEach((value) => {
                innerList.push({id: value.directionid||value.objectiveid, name: value.name || value.description})
            });
            // From here we can find the information about each project and the rest of the renderable information
            sql = getStakeHolderQuery(projectIDinsert);
            return MySQLLib.query(sql, [id])
        })
        .then(results => {
            // Save the stakeholders, shed extra information (unneeded)
            results.forEach((value) => {
                if (value.departmentid != null){
                    dStake.push({id: value.departmentid, numproj: value.numproj, name: value.name});
                }
                else if (value.companyid != null){
                    cStake.push({id: value.companyid, numproj: value.numproj, name: value.name})
                }
            });
            sql = getSupportersQuery(projectIDinsert)
            return MySQLLib.query(sql, [id])
        })
        .then(results => {
            //Savehte supporters, shed extra information (unneeded)
            results.forEach(value => {
                console.log(value)
                supporters.push({id: value.supporterid, numproj: value.numprojects, name: value.name});
            });
            resolve({data: {
                genericList: innerList,
                depStake: {list: dStake, level: 3},
                compStake: {list: cStake, level: 3},
                supporters: {list: supporters, level: 2},
                owners: {list: owners, level: 1}
            }});
        })
        .catch(err=>{
            console.error('Error',err);
            reject({response: "Internal server error!"});
        });
    });
}


// Login
router.post('/login', (req, res) => {
    // Get the login information
    console.log(req.body);
    bcrypt.genSalt(10, function(err, salt){
        if (err) throw err;
        bcrypt.hash("timtim12", salt, function(err, hash){
            if (err) throw err;
            let a = "$2b$10$klhhAuAw41zFaZ9E32qRJu2aOoraUg.0xXX6P3qk8X8VGEMfedKN6"
            let b = `${hash}`
            console.log(a, a.length,"\n",b, b.length);
            res.redirect('/');
        })
    })
});

/**
 * Accessor for priority information, given id
 */
router.get('/get-priority', (req, res) =>{
    // Query contains the information for the strategy
    /**
     * @todo Handle errors 
     */
    // Using this a lot therefore, created this string to reuse
    let projectIDinsert = `
    select p.projectid from project p 
        where p.objectiveid in (
            select distinct o.objectiveid 
            from objective o 
            where o.directionid in (
                select distinct d.directionid 
                from direction d 
                where d.priorityid = ?
            )
        )
    `;
    let distinctObjInsert = `select distinct o.objectiveid 
    from objective o 
    where o.directionid in (
        select distinct d.directionid
        from direction d 
        where d.priorityid = ?
    )`;
    let genericList = `select d.directionid, d.name from direction d where d.directionid in ( select distinct d.directionid from direction d where d.priorityid = ?);`
    groupProjectInformation(projectIDinsert, distinctObjInsert, genericList,req.query.id)
        .then( result => {
            result.type = "priority",
            result.data.genericList = {list: result.data.genericList, type: 'direction'};
            res.json(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        })
});

/**
 * Route for getting the projects from the priority
 */
router.get('/get-priority-projects', (req, res) =>{
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
    let projectIDinsert = `
        select distinct o.objectiveid 
        from objective o 
        where o.directionid = ?
    `;
    let distinctObjInsert = `
    select p.projectid 
	from project p 
	where p.objectiveid in (
		select distinct o.objectiveid 
		from objective o 
		where o.directionid = 1
    )`;
    let genericListQuery = `select o.objectiveid, o.description from objective o 
    where o.objectiveid in ( 
        select distinct 
        o.objectiveid from objective o
        where o.directionid = 1
    )`
    groupProjectInformation(projectIDinsert, distinctObjInsert, genericListQuery, req.query.id)
        .then( result => {
            result.type = "direction",
            result.data.genericList = {list: result.data.genericList, type: 'objective'};
            res.json(result);
        })
        .catch(err => {
            res.status(500).json(err);
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
    MySQLLib.query(whereIDEscaped(tables.project, tables.objective), [req.query.id])
        .then(results => {
            // Need only to get one level of depth since we are simply looking at objective information
            console.log('Proper execution', results);
            /**
             * @todo: Parse the projects
             */
            res.json({response: 'Objectives worked'});
        })
        .catch(err => {
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
    MySQLLib.query(whereIDEscaped(tables.project, tables.project), [req.query.id])
        .then(results => {
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
});

module.exports = router;