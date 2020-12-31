const main = document.getElementById('main-container');

/**
 * @description Calling the backend to get data from the specified URL with formatted string
 * @param {Event} event 
 * @param {HTMLElement} target 
 * @param {Number} id 
 */
function clickableElement(event, target, id){
    // Create URL for fetching backend data using Fetch API
    let type = target.getAttribute('type');
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
            console.log(result, 'DONE');
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
function createBreakdown(type, list){
    // For now is just a list of elements
    if (type == 'compStake' || type == 'depStake'){
        type = 'stakeholder';
    }
    let ulEl = document.createElement('ul');
    createList({type, list}, ulEl);
    return ulEl;
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
        listItem.setAttribute('numProj', list[i].numproj);
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
        let leftBox = document.createElement('div');
        let rightBox = document.createElement('div');
        let objectList = document.createElement('ul');
        // Create the left box items
        leftBox.appendChild(createList(data.genericList, objectList));
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
        leftBox.id = 'left-object-box';
        rightBox.id = 'right-object-box';
        listElements.sort((a,b) => {
            return a.level - b.level;
        });
        listElements.forEach((value, i) => {
            console.log(value);
            listElements[i] = {
                header: createHeader(value.type, value.list),
                bd: createBreakdown(value.type, value.list),
            }
        });
        appendToElement(rightBox, listElements);
        leftBox.appendChild(objectList);
        box.appendChild(leftBox);
        box.appendChild(rightBox);
        // Mina page could have more than one element, this should only execute one loop
        while (main.children[0] != undefined){
            main.removeChild(main.children[0]);
        }
        console.log(box)
        resolve(box);
    });
}

async function createDirectionBox(data){
    let main = await createNewBox(data);
    console.log(main);
    return Promise.resolve(main);
}