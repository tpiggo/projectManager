const main = document.getElementById('main-container');
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
            console.log("response", result);// use the result
            switch (result.type){
                case 'direction':
                    return createDirectionBox(result.data);
                default:
                    return createNewBox(result.data);
            }
        })
        .then(result => {
            // Push the box to the front and remove spinner
            main.appendChild(result);
        })
        .catch(err=>console.error(err));
}

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
        div.appendChild(el.header);
        div.appendChild(el.bd);
        parent.appendChild(div);
    }
}

function createNewBox(data){
    return new Promise((resolve, reject) =>{
        let box = document.createElement('div');
        box.id='pod-breakdown';
        let leftBox;
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
        rightBox.id = 'right-object-box';
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
            leftBox = document.createElement('div');
            leftBox.appendChild(createList(
                data.genericList, 
                document.createElement('ul')
            ));
            leftBox.id = 'left-object-box';
            box.appendChild(leftBox);
        }
        appendToElement(rightBox, listElements);
        box.appendChild(rightBox);
        // Mina page could have more than one element, this should only execute one loop
        while (main.children[0] != undefined){
            main.removeChild(main.children[0]);
        }
        resolve(box);
    });
}

async function createDirectionBox(data){
    let main = await createNewBox(data);
    return Promise.resolve(main);
}