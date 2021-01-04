var userExecution = [];
var current = {type: null, id: null};
/**
 * @todo Add comments!!!! 
 */


/**
 * @description Calling the backend to get data from the specified URL with formatted string
 * @param {Event} event 
 * @param {HTMLElement} target 
 * @param {Number} id 
 */
function clickableElement(event, target, id){
    // Create URL for fetching backend data using Fetch API
    let type = target.getAttribute('type');
    let name = target.innerHTML;
    console.log(type);
    if (type != 'priority' && !target.classList.contains('active')){
        let genericList = target.parentElement;
        console.log('shoudl be here')
        for (let i = 0; i < genericList.children.length; i++){
            genericList.children[i].classList.remove('active');
        }
        target.classList.add('active');
    }
    getTypeBackend(name, type, id);
    // add it to list of clicked elements for Back function!
    if ( current.type != null && current.id != null){
        userExecution.push(current);
    }
    current = {type: type, id: id};
}

/**
 * Go back on the users execution
 */
function goBack(){
    last = userExecution.pop();
    current = last;
    getTypeBackend(last.type, last.id);
}

/**
 * @param {String} name
 * @param {String} type 
 * @param {Number} id 
 */
function getTypeBackend(name, type, id){
    let url = `/DBApi/get-${type}?id=${id}`;
    fetch(url)
        .then(response => response.json())// parse the body to a json
        .then(result =>{
            if (type == 'project'){
                return handleProject(result.data);
            }
            createBox(result.type, result.data, result.id, name);
        })
        .catch(err=>console.error(err));
}

/**
 * 
 * @param {String} type 
 * @param {Number} id 
 */
function getProjectsOfType(type, id){
    let url = `/DBApi/get-${type}-projects?id=${id}`;
    fetch(url)
        .then(response => response.json())
        .then(result => {
            if ( result.data.length < 1){
                throw Error('Error: Server error! Try again later!');
            }
            createBox(result.type, result.data, result.id);
            id = result.data[0].id;
            // Get the first project
            return getProject(id);
        })
        .then(result => {
            createProject(result.data, document.getElementById('project-box'));
        })
        .catch(err => {
            console.error('Error occurred:', err);
        });
} 

/**
 * 
 * @param {Number} id 
 */
function getProject(id){
    let url = `/DBApi/get-project?id=${id}`
    // Creates Promise for easy interaction
    return new Promise((resolve, reject) => {
        fetch(url)
            .then(response => {
                resolve(response.json())
            })
            .catch(err => {
                reject(err);
            });
    });
}

/**
 * 
 * @param {JSON} data 
 */
function handleProject(data){
    let projectBox = document.getElementById('project-box');
    if (projectBox != undefined && projectBox.children.length <= 1){
        while (projectBox.children[0] != undefined){
            projectBox.removeChild(projectBox.children[0]);
        }
        createProject(data, projectBox);
        return;
    } else if (projectBox != undefined){
        replaceProject(data, projectBox);
        return;
    } else {
        throw Error('No project box! Execution was wrong!');
    }
}

/**
 * @description creates a project when no project in the project box exists
 * @param {JSON} projData 
 * @param {HTMLElement} projectBox
 */
function createProject(projectData, projectBox){
    // Using promises in order to asynchoronously create all elements
    Promise.all([
        createTopInformation({
            id: projectData.project.id,
            name: projectData.project.name,
            priority: projectData.project.priority,
            direction: projectData.project.direction,
            objective: projectData.project.objective
        }),
        createLeftProjectBox(
            {
                type: 'type',
                list: [projectData.project.vision, projectData.project.scope],
                left: projectData.project.projecttype
            },
            {
                type: 'owner',
                list: projectData.supporters,
                left: projectData.project.owner
            },
            {
                type: 'budget',
                list: projectData.budgetBreakdown,
                left: projectData.project.budget
            }

        ),
        createRightProjectBox(
            projectData.strategicKPI,
            projectData.projectKPI,
            projectData.stakeholders,
            'project-info-right'
        ),
        createFooterTable(projectData.milestones)
    ])
        .then(results => {
            let middleBox = document.createElement('div');
            middleBox.id='project-detailed-info'
            results.forEach(value => {
                if (value.id.includes('project-info-')){
                    middleBox.appendChild(value);
                } else if(middleBox.children.length > 1){
                    projectBox.appendChild(middleBox);
                    projectBox.appendChild(value);
                } else {
                    projectBox.appendChild(value);
                }
            });
        })
        .catch(err => {
            console.error(err);
        });
}

/**
 * @description the top box of information about a porject
 * @param {JSON} data 
 * @returns {Promise<HTMLElement>}
 */
function createTopInformation(data){
    return new Promise(resolve => {
        let topLine = document.createElement('div');
        topLine.id = 'project-info';
        Object.keys(data).forEach(value => {
            topLine.innerHTML += `<div id=project-${value}>${data[value]}</div>`;
        });
        resolve(topLine);
    });
}

/**
 * @description Creates right box of project information
 * @param {Array} stratKPI 
 * @param {Array} projectKPI 
 * @param {Array} stakeholders 
 * @param {String} boxId 
 * @returns {Promise<HTMLElement>}
 */
function createRightProjectBox(stratKPI, projectKPI, stakeholders, boxId){
    return new Promise(resolve => {
        let box = document.createElement('div');
        box.id = boxId;
        let innerHTML = '<div id="strategic-kpi"><h3>Strategic KPI</h3>';
        let i = 1;
        for ( let kpi of stratKPI){
            innerHTML += `<div id='strategic-kpi-${i}' class='strategic-kpi'>${kpi.kpi}</div>`;
            i++;
        }
        innerHTML += '</div><div id="project-kpi"><h3>Project KPI</h3>';
        i = 1;
        for (let kpi of projectKPI){
            innerHTML += `<div id='project-kpi-${i}' class='project-kpi'>${kpi.kpi}</div>`;
            i++;
        }
        innerHTML += '</div><div id="stakeholders"><h3>Stakeholders</h3>';
        i = 1;
        for (let stake of stakeholders){
            let onclick = `getDeptartment(${stake.id})`;
            if (stake.type == 'comp'){
                onclick = `getCompany(${stake.id})`;
            }
            innerHTML += `<div id="stake-${i}" class='stakeholder' onclick="${onclick}">${stake.name}</div>`;
            i++;
        }
        innerHTML += '</div>';
        box.innerHTML = innerHTML;
        resolve(box);
    });
}

/**
 * @description creates teh left box of project information
 * @param  {...{type:String, list: Array, left: String}} innerDivs
 * @returns {Promise<HTMLElement>} 
 */
function createLeftProjectBox(...innerDivs){
    return new Promise(resolve => {
        let box = document.createElement('div');
        box.id = 'project-info-left';
        for (let child of innerDivs) {
            if (child.type == 'type'){
                let innerDiv = document.createElement('div');
                innerDiv.id = 'project-type';
                innerDiv.className = 'left-right-table';
                let svDiv = document.createElement('div');
                svDiv.id = 'scope-vision';
                innerDiv.innerHTML = `<div id='project-type-text' class='type-overview'>Type: ${child.left}</div>`;
                svDiv.innerHTML += `<div id='vision'>Vision: ${child.list[0]==undefined?'None':child.list[0]}</div>`;
                svDiv.innerHTML += `<div id='scope'>Scope: ${child.list[1]==undefined?'None':child.list[1]}</div>`;
                innerDiv.appendChild(svDiv);
                box.appendChild(innerDiv);
            } else if (child.type == 'owner' || child.type == 'budget') {
                let inner = createLeftInnerDiv({type: child.type, list: child.list, left: child.left, className: 'left-right-table'});
                box.appendChild(inner);
            } else {
                console.log("ERROR: No type match!");
            }
        }
        resolve(box);
    });
}

/**
 * @description Creates the inner structure of the left box of information for a project
 * @param {{type: String, list: Array, left: string, className: string}} data
 * @returns {HTMLElement} 
 */
function createLeftInnerDiv(data){
    let innerDiv = document.createElement('div');
    let info = data.type=='budget'?['budget', 'budget breakdown','description','amount']:['department', 'supporters', 'name', 'role'];
    innerDiv.className = data.className;
    let capitalized = data.type.slice(0,1).toUpperCase() + data.type.slice(1);
    innerDiv.innerHTML = `<div id='${info[0]}' class='type-overview'>${capitalized}: ${data.left}</div>`;
    if ( data.list.length < 1){
        innerDiv.innerHTML = `<div id='supporters'><b>No ${info[1]} found!!</b></div>`;
    } else {
        let table = document.createElement('table');
        info[1] = info[1].replace(' ', '-');
        table.id = `${info[1]}-table`;
        table.className = 'right-table';
        let tableBody = document.createElement('tbody');
        for (let child of data.list){
            let onclick= data.type=='budget'?'':`getDepartment(${child.id})`;// Need to send the id with supporters to use this
            tableBody.innerHTML +=`<tr><td class='${info[1]}'>${child[info[2]]}</td><td>${child[info[3]]}</td></tr>`
        }
        table.appendChild(tableBody);
        innerDiv.appendChild(table);
    }
    return innerDiv;
}

/**
 * @description Creates the Milestones table
 * @param {Array} milestones 
 * @returns {Promise<HTMLElement>}
 */
function createFooterTable(milestones){
    return new Promise(resolve => {
        let table = document.createElement('table');
        table.id = 'milestone-table'
        let tableBody = document.createElement('tbody');
        tableBody.innerHTML = `<tr>
            <th>Milestone Description</th>
            <th>Start Date</th>
            <th>End Date</th>
        </tr>`
        if ( milestones.length < 1){
            tableBody.innerHTML += `<tr><td colspan='3'><b>No Milestones found!</b></td></tr>`
        } else {
            for ( let milestone of milestones){
                tableBody.innerHTML += `<tr>
                    <td>${milestone.description}</td>
                    <td>${milestone.start}</td>
                    <td>${milestone.deadline}</td>
                </tr>`
            }
        }
        table.appendChild(tableBody);
        resolve(table);
    });
}


/**
 * 
 * @param {JSON} projData 
 */
function replaceProject(projectData){
    console.log(projectData);
    Promise.all([
        replaceTopLine({
            id: projectData.project.id,
            name: projectData.project.name,
            priority: projectData.project.priority,
            direction: projectData.project.direction,
            objective: projectData.project.objective
        }),
        replaceLeftProjectBox(
            {
                type: 'type',
                list: [projectData.project.vision, projectData.project.scope],
                left: projectData.project.projecttype
            },
            {
                type: 'owner',
                list: projectData.supporters,
                left: projectData.project.owner
            },
            {
                type: 'budget',
                list: projectData.budgetBreakdown,
                left: projectData.project.budget
            }

        ),
        replaceRightProjectBox(
            projectData.strategicKPI,
            projectData.projectKPI,
            projectData.stakeholders,
            'project-info-right'
        ),
        replaceFooterTable(projectData.milestones)
    ])
        .then(results => {
            console.log("Done replacing")
        })
        .catch(err => {
            console.error(err);
        });
}

/**
 * 
 * @param {HTMLElement} node 
 * @param {Number} id 
 */
function removeChildren(node, id){
    if (node == undefined){
        throw Error('Bad node');
    }
    while (node.children[id] != undefined){
        node.removeChild(node.children[id]);
    }
}

/**
 * @description the top box of information about a porject
 * @param {JSON} data 
 * @returns {{status: Number}}
 */
function replaceTopLine(data){
    return new Promise(resolve => {
        Object.keys(data).forEach(value =>{
            let element = document.getElementById(`project-${value}`);
            element.innerHTML = data[value];
        });
        resolve({status: 0});
    });
}

/**
 * @description replaces teh left box of project information
 * @param  {...{type:String, list: Array, left: String}} innerDivs
 * @returns {{status: Number}} 
 */
function replaceLeftProjectBox(...innerDivs){
    console.log(innerDivs);
    return new Promise(resolve => {
        let tableContainers = document.getElementsByClassName('left-right-table');
        for (let child of innerDivs){
            if (child.type == 'type'){
                let element = document.getElementById('project-type-text');
                element.innerHTML = `Type: ${child.left}`;
                element = element.nextElementSibling.firstChild;
                console.log(element);
                element.innerHTML = `Vision: ${child.list[0]!=undefined?child.list[0]:'None'}`;
                element = element.nextElementSibling;
                console.log(element);
                element.innerHTML = `Scope: ${child.list[1]!=undefined?child.list[1]:'None'}`;
            } else if (child.type == 'owner' || child.type == 'budget') {
                let element, onclick = '';
                let info = [];
                if ( child.type == 'owner'){
                    element = tableContainers[1].firstElementChild;
                    console.log(element);
                    info = ['supporters', 'name', 'role'];
                    child.id = child.id==undefined?-1:child.id;
                    onclick = `getDepartment(${child.id})`
                    element.setAttribute('onclick', onclick);
                } else {
                    element = tableContainers[2].firstElementChild;
                    info = ['budget-breakdown','description','amount'];
                }
                console.log(element, tableContainers);
                let capitalize = child.type.slice(0,1).toUpperCase() + child.type.slice(1);
                element.innerHTML = `${capitalize}: ${child.left}`;
                element = element.nextElementSibling.firstChild;
                removeChildren(element, 0);
                for (let data of child.list){
                    child.id = child.id==undefined?-1:child.id;
                    onclick = child.type=='budget'?'':`getDepartment(${child.id})`;// Need to send the id with supporters to use this
                    element.innerHTML +=`<tr><td class='${info[0]}' onclick=${onclick}>${data[info[1]]}</td><td>${data[info[2]]}</td></tr>`
                }
            } else {
                console.log("ERROR: No matching type!");
            }
        }
        resolve({status: 0});
    });
}

/**
 * @description replaces right box of project information
 * @param {Array} stratKPI 
 * @param {Array} projectKPI 
 * @param {Array} stakeholders 
 * @param {String} boxId 
 * @returns {{status: Number}}
 */
function replaceRightProjectBox(stratKPI, projectKPI, stakeholders){
    return new Promise(resolve =>{
        let currentDiv = document.getElementById('strategic-kpi');
        removeChildren(currentDiv, 1);
        let i = 1;
        for ( let kpi of stratKPI){
            currentDiv.innerHTML += `<div id='strategic-kpi-${i}' class='strategic-kpi'>${kpi.kpi}</div>`;
            i++;
        }
        currentDiv = document.getElementById('project-kpi');
        removeChildren(currentDiv, 1);
        i = 1;
        for (let kpi of projectKPI){
            currentDiv.innerHTML += `<div id='project-kpi-${i}' class='project-kpi'>${kpi.kpi}</div>`;
            i++;
        }
        currentDiv = document.getElementById('stakeholders');
        removeChildren(currentDiv, 1);
        i = 1;
        for (let stake of stakeholders){
            let onclick = `getDeptartment(${stake.id})`;
            if (stake.type == 'comp'){
                onclick = `getCompany(${stake.id})`;
            }
            currentDiv.innerHTML += `<div id="stake-${i}" class='stakeholder' onclick="${onclick}">${stake.name}</div>`;
            i++;
        }
        resolve({status: 0});
    });
}


/**
 * @description Replaces the Milestones table with the new information
 * @param {Array} milestones 
 * @returns {{status: Number}}
 */
function replaceFooterTable(milestones){
    return new Promise(resolve =>{
        //Get the table body
        let tableBody = document.getElementById('milestone-table').firstChild;
        // remove the elements after the header
        if ( milestones.length > 1) {
            while (tableBody.children[1] != undefined){
                tableBody.removeChild(tableBody.children[1]);
            }
            for ( let milestone of milestones){
                tableBody.innerHTML += `<tr>
                    <td>${milestone.description}</td>
                    <td>${milestone.start}</td>
                    <td>${milestone.deadline}</td>
                </tr>`;
            }
        }
        resolve({status: 0});
    });
}


/**
 * @description Creating a box which lives within the main container. Given the type, the new box either enters the
 *              existing inner container or creates a completely new container within the main container.
 * @param {String} name
 * @param {String} type 
 * @param {JSON} data 
 */
function createBox(type, data, id, name=''){
    let aPromise ;
    let appendID='main-container';
    if ( type ==  'direction'){
        aPromise = createDirectionBox(data, type, id, name);
        appendID = 'priority-detailed'
    } else if ( type.includes('projects')){
        // We know that all types of project listables are returned in this form
        aPromise = createProjectsBox(data, type);
    } else {
        if ( type == 'objective'){
            appendID = 'direction-detailed'
        }
        aPromise = createNewChartBox(data, type, id, name);
    }
    // Handle the promise
    aPromise
        .then(result => {
            let appendBox = document.getElementById(appendID);
            while (appendBox.children[0] != undefined){
                appendBox.removeChild(appendBox.children[0]);
            }
            appendBox.appendChild(result);
        })
        .catch(err=> {
            console.error(err);
        });
} 

/**
 * 
 * @param {String} type 
 * @param {Array} list 
 */
function createHeader(type, list){
    if (type == 'compStake' || type == 'depStake'){
        type = 'stakeholder';
    }
    let h5 = document.createElement('h5');
    h5.innerHTML = ` Number of ${type}: ${list.length}`;
    return h5;
}

/**
 * 
 * @param {String} type 
 * @param {Array} list 
 */
function createBreakdown(type, list){
    // For now is just a list of elements
    if (type == 'compStake' || type == 'depStake'){
        type = 'stakeholder';
    }
    // create Doughnut with ChartJS
    let newDoughnut = document.createElement('canvas');
    newDoughnut.id = `graph-${type}`;
    let mDoughnut = newDoughnut.getContext('2d');
    let labels  = [], data = [], backgroundColours = [], i=0;
    list.forEach(value => {
        labels.push(value.name);
        data.push(value.numproj);
        let r = Math.ceil(Math.random()*256);
        let g = Math.ceil(Math.random()*256);
        let b = Math.ceil(Math.random()*256);
        backgroundColours.push(`rgb(${r},${g},${b})`);
    });
    let mChart = new Chart(mDoughnut, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: "Number of Projects",
                data: data,
                backgroundColor : backgroundColours
            }]
        }
    });
    return newDoughnut;
}
/**
 * 
 * @param {String} type, list
 * @param {Array<JSON>} list
 * @param {HTMLElement} parent 
 */
function createList({type, list}, parent){
    for (let i = 0; i < list.length; i++){
        let listItem = document.createElement('li');
        listItem.innerHTML = list[i].name;
        listItem.className = 'generic-list-item';
        listItem.setAttribute('type', type);
        let onclick = `clickableElement(event, this, ${list[i].id})`;
        listItem.setAttribute('onclick', onclick);
        parent.appendChild(listItem);
    }
    return parent;
}

/**
 * 
 * @param {HTMLElement} parent 
 * @param  {Array{JSON}} listableElements 
 */
function appendToElement(parent, listableElements){
    for (let el of listableElements){
        let div = document.createElement('div');
        if (el instanceof HTMLElement){
            div = el;
        } else {
            div.appendChild(el.header);
            div.appendChild(el.bd);
        }
        parent.appendChild(div);
    }
}

/**
 * 
 * @param {Array} data 
 * @param {String} type 
 */
function createProjectsBox(data, type){
    return new Promise((resolve, reject) => {
        let newDiv = document.createElement('div');
        newDiv.id = type;
        let leftBox = document.createElement('ul');
        leftBox.id = 'project-list';
        leftBox.className = 'generic-list'
        let rightBox = document.createElement('div');
        rightBox.id = 'project-box';
        createList({type: 'project', list: data}, leftBox);
        appendToElement(newDiv, [leftBox, rightBox]);
        resolve(newDiv);
    });
}

/**
 * 
 * @param {JSON} data
 * @param {String} type
 * @returns {Promise<HTMLLIElement>}
 */
function createNewChartBox(data, boxType, id, name=''){
    console.log(data, boxType, name, id);
    return new Promise((resolve, reject) =>{
        let box = document.createElement('div');
        box.id=`${boxType}-breakdown`;
        let rightBox = document.createElement('div');
        let listElements = [];
        let contained = {};
        let i = 0;
        Object.keys(data).forEach(value => {
            if (value != 'genericList'){
                if (value == 'compStake' || value == 'depStake'){
                    type = 'stakeholder';
                } else {
                    type = value;
                }
                if (contained[type] != undefined){
                    listElements[contained[type]].list = listElements[contained[type]].list.concat(data[value].list);
                } else {
                    contained[type] = i;
                    listElements.push({
                        type: type,
                        list: data[value].list,
                        level: data[value].level
                    });
                    i++;
                }
            }
        });
        rightBox.id = `${boxType}-detailed`;
        listElements.sort((a,b) => {
            return a.level - b.level;
        });
        listElements.forEach((value, i) => {
            listElements[i] = {
                header: createHeader(value.type, value.list),
                bd: createBreakdown(value.type, value.list),
            }
        });
        // Create the left box items
        if (data.genericList.list != undefined && data.genericList.list.length > 0){
            let leftBox = document.createElement('ul');
            leftBox.className = 'generic-list';
            createList(data.genericList, leftBox);
            leftBox.id = `${boxType}-list`
            box.appendChild(leftBox);
        }
        if (name != ''){
            let title = document.createElement('div');
            title.id = 'element-name';
            title.innerHTML = name;
            rightBox.appendChild(title);
        }
        let footer = document.createElement('button');
        footer.id = `${boxType}-get-projects`;
        footer.setAttribute('onclick', `getProjectsOfType('${boxType}', ${id})`);
        footer.innerHTML = 'See all projects!';
        appendToElement(rightBox, listElements.concat(footer));
        box.appendChild(rightBox);
        resolve(box);
    });
}

async function createDirectionBox(data, type, id, name=''){
    let main = await createNewChartBox(data, type, id, name);
    // Want to add mroe data here
    return Promise.resolve(main);
}