const express = require('express');
var router = express.Router(),
    MySQLLib = require('../db/js/mysqlLib'),
    bodyParser = require('body-parser');


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

function getProjects(insertable){
    return ` select
    p.projectid as id, 
    p.name as name
    from project p
    where p.objectiveid
    ${insertable}
    order by id;`
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
    where p.objectiveid ${insertable}
    group by id;`   
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
    where s.projectid 
    ${insertable}
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
    where s.projectid
    ${insertable} 
    group by s.departmentid;`;
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
            sql = genericListQuery;
            // Case where getting objective information
            if ( genericListQuery.length <= 0){
                return Promise.resolve([]);
            } else {
                return MySQLLib.query(sql, [id]);
            }
        })
        .then(results => {
            // Save the innerList (direction or objectives), shed extra information (unneeded)
            // We may not need this when using objectives, therefore results could be empty
            if (results.length > 0){
                results.forEach((value) => {
                    innerList.push({id: value.directionid||value.objectiveid, name: value.name || value.description})
                });
            }
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
            resolve({
                data: {
                    genericList: innerList,
                    depStake: {list: dStake, level: 3},
                    compStake: {list: cStake, level: 3},
                    supporters: {list: supporters, level: 2},
                    owners: {list: owners, level: 1}
                },
                id : id
            });
        })
        .catch(err=>{
            console.error('Error',err);
            reject({response: "Internal server error!"});
        });
    });
}

router.post('/test', (req, res) => {
    console.log(req);
    console.log(req.headers);
    req.
    res.json({res: "answering"});

})
/**
 * Accessor for priority information, given id
 */
router.get('/get-priority', (req, res) =>{
    // Query contains the information for the strategy
    /**
     * @todo Handle errors 
     */
    // Using this a lot therefore, created this string to reuse
    let projectIDinsert = `in (
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
    )`;
    let distinctObjInsert = ` in (
        select distinct o.objectiveid 
        from objective o 
        where o.directionid in (
            select distinct d.directionid
            from direction d 
            where d.priorityid = ?
        )
    )`;
    let genericList = `select d.directionid, d.name from direction d where d.directionid in ( select distinct d.directionid from direction d where d.priorityid = ?);`
    groupProjectInformation(projectIDinsert, distinctObjInsert, genericList,req.query.id)
        .then( result => {
            result.type = "priority";
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
    let projectInsert = `in (
        select distinct o.objectiveid
        from  objective o
        where o.directionid in (
            select distinct d.directionid
            from direction d
            where d.priorityid = ?	
        )
    )`;
    console.log(req.query);
    MySQLLib.query(getProjects(projectInsert), req.query.id)
        .then(results => {
            res.json({data: results, type: 'priority-projects'});
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({response: "Internal server error!"});
        });
});

/**
 * Accessor for direction information, given id
 */
router.get('/get-direction', (req, res) =>{
    /**
     * @todo Handle errors 
     */
    let projectIDinsert = `in (
        select distinct o.objectiveid 
        from objective o 
        where o.directionid = ?
    )`;
    let distinctObjInsert = `in (
        select p.projectid 
        from project p 
        where p.objectiveid in (
            select distinct o.objectiveid 
            from objective o 
            where o.directionid = ?
        )
    )`;
    let genericListQuery = `
    select o.objectiveid, o.description from objective o 
    where o.objectiveid in ( 
        select distinct 
        o.objectiveid from objective o
        where o.directionid = ?
    )`;
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
    let projectInsert = `in (
        select distinct o.objectiveid
        from  objective o
        where o.directionid = ?
    )`  
    MySQLLib.query(getProjects(projectInsert), req.query.id)
        .then(results => {
            res.json({data: results, type: 'direction-projects'});
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({response: "Internal server error!"});
        });
})
/**
 * Accessor for objective information, given id
 */
router.get('/get-objective', (req, res)=>{
    /**
     * @todo Handle errors 
     */
    let projectIDinsert = ` = ? `;
    let distinctObjInsert = '= ?';

    groupProjectInformation(projectIDinsert, distinctObjInsert, '', req.query.id)
        .then( result => {
            result.type = 'objective';
            res.json(result);
        })
        .catch(err => {
            res.status(500).json(err);
        });
});

/**
 * Route for getting the projects from the objective
 */
router.get('/get-objective-projects', (req, res)=>{
    /**
     * @todo Handle errors 
     */
    let projectInsert = '= ?'  
    MySQLLib.query(getProjects(projectInsert), req.query.id)
        .then(results => {
            res.json({data: results, type: 'objective-projects'});
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({response: "Internal server error!"});
        });
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
    let sql = `select
    p.projectid as id,
    p.name as name,
    p.description as description,
    (select p2.name from priority p2 where p2.priorityid in (
          select d3.priorityid from direction d3 where d3.directionid in (
                  select o.directionid from objective o where o.objectiveid = p.objectiveid 
          ) 
    )) as priority,
    (select d2.name from direction d2 where d2.directionid in (
          select o.directionid from objective o where o.objectiveid = p.objectiveid 
    )) as direction, 
    (select o.description from objective o where o.objectiveid = p.objectiveid) as objective,
    (select d.name from department d where d.departmentid = p.owner) as owner,
    (select t.name from projecttype t where t.typeid = p.projecttype) as projecttype,
    p.budget as budget,
    p.vision as vision, 
    p.projectscope as porjectscope,
    p.weight as weight,
    p.survery as survey
    from project p 
    where p.projectid = ?;`;
    // Can't use the same promise as when getting direction, objetive, and priority, we need different information
    let project;
    let strategic = [], supporters = [], stakeholder = [], budgetBreak = [], projectKPI = [], milestones = []; 
    MySQLLib.query(sql, req.query.id)
        .then(results => {
            if (results.length > 1){
                throw Error('Error: Too many projects matching id.');
            }
            project = results[0];
            // Get strategic KPI
            sql = `select sk.kpi
            from strategickpi sk 
            where sk.kpiid in (
                select psk.strategickpiid 
                from projectstrategickpi psk
                where psk.projectid = ?
            );`;
            return MySQLLib.query(sql, req.query.id);
        })
        .then(results=> {
            strategic = results;
            // Get supporter information
            sql =  `select 
            (select d.name from department d where d.departmentid = s.departmentid) as dept,
            s.supportrole as supportrole
            from supporter s 
            where s.projectid = ?`;
            return MySQLLib.query(sql, req.query.id);
        })
        .then(results=> {
            results.forEach(value => {
                // Push the values into the array
                supporters.push({name: value.dept, role: value.supportrole});
            });
            // Get stakeholder information
            sql =  `select
            s.companyid,
            s.departmentid,
            case when s.departmentid is not null then d.name else c.name end as name
            from stakeholder s 
            left join department d on s.departmentid = d.departmentid
            left join company c on s.companyid = c.companyid
            where s.projectid = 1 
            group by s.companyid , s.departmentid;`;
            return MySQLLib.query(sql, req.query.id);
        })
        .then(results=> {
            results.forEach(value => {
                // Push the values into the array
                let type = 'dept';
                if (value.departmentid == null){
                    type = 'comp';
                }
                stakeholder.push({
                    name: value.name,
                    id: value.companyid || value.departmentid,
                    type: type
                });
            });
            // Get budget breakdown 
            sql =  'select b.bddescr, b.bdamount from budgetbreakdown b where b.projectid = ?;';
            return MySQLLib.query(sql, req.query.id);
        })
        .then(results=> {
            results.forEach(value => {
                // Push the values into the array
                budgetBreak.push({
                    description: value.bddescr,
                    amount: value.bdamount
                });
            });
            // Get Project specific KPIs
            sql =  'select p.kpi from projectkpi p where p.projectid = ?;';
            return MySQLLib.query(sql, req.query.id);
        })
        .then(results=> {
            projectKPI = results;
            // Get milestones
            sql =  'select m.description, m.startdate , m.deadline from milestone m where m.projectid = ?;';
            return MySQLLib.query(sql, req.query.id);
        })
        .then(results=> {
            results.forEach(value => {
                milestones.push({
                    description: value.description,
                    start: value.startdate,
                    deadline: value.deadline
                });
            });
            let returnable = {
                project: project,
                strategicKPI: strategic,
                supporters: supporters,
                stakeholders: stakeholder,
                budgetBreakDown: budgetBreak,
                projectKPI: projectKPI,
                milestones: milestones 
            }
            res.json({data: returnable, type: 'project'});
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({response: 'Internal Server Error'});
        });

});

module.exports = router;