var userExecution = [];
var current = {type: null, id: null};
/**
 * @description Calling the backend to get data from the specified URL with formatted string
 * @param {Event} event 
 * @param {HTMLElement} target 
 * @param {Number} id 
 */
function clickableElement(event, target, id){
    // Create URL for fetching backend data using Fetch API
    let type = target.getAttribute('type');
    getTypeBackend(type, id);
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
    console.log(last);
    current = last;
    getTypeBackend(last.type, last.id);
}

/**
 * 
 * @param {String} type 
 * @param {Number} id 
 */
function getTypeBackend(type, id){
    let url = `/DBApi/get-${type}?id=${id}`
    fetch(url)
        .then(response => response.json())// parse the body to a json
        .then(result =>{
            if (type == ' project'){
                return createProject(result.data);
            }
            createBox(result.type, result.data, result.id);
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
            console.log(result);
            if ( result.data.length < 1){
                throw Error('Error: Server error! Try again later!');
            }
            console.log(result);
            createBox(result.type, result.data, result.id);
            id = result.data[0].id;
            // Get the first project
            return getProject(id);
        })
        .then(result => {
            console.log("first project: ", result);
        })
        .catch(err => {
            console.log('Error occurred:', err);
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
 * @param {HTMLElement} target 
 * @param {Number} id 
 */
function clickProject(target, id){
    getProject(id)
        .then(result => {
            createProject(result);
        })
        .catch(err => {
            console.error(err);
        });
}

/**
 * 
 * @param {*} projData 
 */
function createProject(projData){

}

/**
 * 
 * @param {String} type 
 * @param {JSON} data 
 */
function createBox(type, data, id){
    let aPromise ;
    let appendID='main-container';
    console.log(type.includes('projects'), type)
    if ( type ==  'direction'){
        aPromise = createDirectionBox(data, type, id);
        appendID = 'priority-detailed'
    } else if ( type.includes('projects')){
        // We know that all types of project listables are returned in this form
        aPromise = createProjectsBox(data, type);
    } else {
        if ( type == 'objective'){
            appendID = 'direction-detailed'
        }
        aPromise = createNewChartBox(data, type, id);
    }
    // Handle the promise
    aPromise
        .then(result => {
            console.log(appendID)
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
            }],
        }
    });
    console.log(mChart);
    return newDoughnut;
}
/**
 * 
 * @param {String} type, list
 * @param {Array<JSON>} list
 * @param {HTMLElement} parent 
 */
function createList({type, list}, parent){
    console.log(type, list);
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
        let leftBox = document.createElement('div');
        leftBox.id = 'project-list';
        let rightBox = document.createElement('div');
        rightBox.id = 'project-information';
        console.log(data)
        createList({type, list: data}, leftBox);
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
function createNewChartBox(data, boxType, id){
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
            let leftBox = document.createElement('div');
            leftBox.appendChild(createList(
                data.genericList, 
                document.createElement('ul')
            ));
            leftBox.id = `${boxType}-list`
            box.appendChild(leftBox);
        }
        appendToElement(rightBox, listElements);
        box.appendChild(rightBox);
        let footer = document.createElement('button');
        footer.id = `${boxType}-get-projects`;
        footer.setAttribute('onclick', `getProjectsOfType('${boxType}', ${id})`);
        footer.innerHTML = 'See all projects!';
        box.appendChild(footer);
        resolve(box);
    });
}

async function createDirectionBox(data, type, id){
    let main = await createNewChartBox(data, type, id);
    // Want to add mroe data here
    return Promise.resolve(main);
}