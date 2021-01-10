class ProjectInput {
    id;
    constructor(id){
        this.id = id;
    }
    getId(){
        return this.id;
    }
}

class Supporter extends ProjectInput{
    role;
    constructor(id, role){
        super(id);
        this.role = role;
    }

    setRole(role) {
        this.role = role;
    }

    toJson(){
        return {id: this.id, role: this.role};
    }
}

class Milestone extends ProjectInput{
    start;
    end;
    constructor(id, start, end, desc){
        super(id);
        this.start = start;
        this.end = end;
        this.desc = desc;
    }
    setDesc(description){
        this.desc = description;
    }

    toJson(){
        return {desc: this.desc, start: this.start, end: this.end};
    }
}

class Budget extends ProjectInput{
    breakdown = [];
    amount;
    constructor(id, amount, breakdown=[]){
        super(id);
        this.amount = amount;
        if (breakdown != []){
            this.breakdown = breakdown;
        }
        
    }
    getAmount(){
        return this.amount;
    }
    getBreakdown(){
        return this.breakdown;
    }
    pushToBreakdown(breakdown){
        this.breakdown.push(breakdown);
    }

    toJson(){
        return {amount: this.amount, breakdown: this.breakdown};
    }
    /**
     * @description Recursive function for validating breakdown
     * @param {Number} amount 
     * @param {Array<{amount: Number, desc: String}>} breakdown
     * @returns {Boolean} 
     */
    __isValidBD(amount, breakdown){
        if (breakdown.length == 0){
            return amount>0?false:amount==0?true:false;
        }
        return this.__isValidBD(amount-breakdown[0].amount, breakdown.slice(1));
    }
    /**
     * @description Checks if the budget breakdown is valid
     * @returns {Boolean}
     */
    breakdownIsValid(){
        return this.__isValidBD(this.amount, this.breakdown)
    }
}

class addButton{
    innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                </svg>`;

    onclick = "createInputSpace(this)";

    constructor(){
        this.btn = document.createElement('a');
        this.btn.innerHTML = this.innerHTML;
        this.btn.setAttribute('onclick', this.onclick);
        this.btn.setAttribute('href', 'javascript:void(0)');
        return this.btn;
    }
}

class removeButton{
    innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-dash-circle" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/>
                </svg>`;

    onclick = "removeInputSpace(this)";

    constructor(){
        this.btn = document.createElement('a');
        this.btn.innerHTML = this.innerHTML;
        this.btn.setAttribute('onclick', this.onclick);
        this.btn.setAttribute('href', 'javascript:void(0)');
        return this.btn;
    }
}

/**
 * @description Get the required information when the script loads 
 */
function editorOnLoad(){
    let get = ['priorities', 'types', 'departments', 'stakeholders'];
    let promises = [];
    // Map types to calls
    get.forEach(value => {
        promises.push(fetchInformation(value));
    });
    Promise.all(promises)
        .then(results => {
            console.log(results);
            let chainedPromises = [];
            for (let i = 0; i < results.length; i++){
                if (get[i] == "types"){
                    chainedPromises.push(addToSelects('projectTypes', results[i]));
                } else if (get[i] == 'departments'){
                    chainedPromises.push(addToSelects('owner', results[i]));
                    chainedPromises.push(addToSelects('select-supporter1', results[i]));
                } else if(get[i]=='stakeholders'){
                    chainedPromises.push(addToSelects('select-stakeholder1', results[i]));
                } else {
                    chainedPromises.push(addToSelects(get[i], results[i]));
                }
            }
            return Promise.all(chainedPromises);
        })
        .then(()=> {
            // Finished
            console.log("Done setting up values");
        })
        .catch(err => {
            console.error(err);
            createErrorPopup("Something went wrong! Try again later", document.getElementById('title'));
        });
}

/**
 * 
 * @param {String} elementId
 * @param {Array<{id: Number, name: String, department?: Number }} list The input elements 
 * 
 */
function addToSelects(elementId, list){
    return new Promise(resolve => {
        let element = document.getElementById(elementId);
        list.forEach(value => {
            let inner = '';
            if (elementId == 'select-stakeholder1'){
                let optionType = value.department==1?'department':"company";
                inner = `<option type='${optionType}' value=${value.id}>${value.name}</option>`
            } else {
                inner = `<option value=${value.id}>${value.name}</option>`
            }
            element.innerHTML += inner;
        });
        resolve();
    });
}

/**
 * 
 * @param {String} type 
 */
function fetchInformation(type){
    return new Promise((resolve, reject) => {
        fetch(`/DBApi/get-${type}`)
            .then(response => {
                if (response.status > 300){
                    console.log(response)
                    throw Error('Error occurred! Try again later');
                }
                return response.json();
            })
            .then(result => {
                resolve(result);
            })
            .catch(err => {
                reject(err);
            });
    });
}

/**
 * 
 * @param {HTMLElement} target 
 */
function getSubSelected(target){
    let type = '';
    if (target.id == 'priorities'){
        type = 'directions';
    } else if (target.id == 'directions'){
        type = 'objectives';
    } else if (target.id == 'objectives'){
        type = 'strategic-kpis'
    }
    let url = `${type}?id=${target.value}`;
    console.log(url);
    fetchInformation(url)
        .then(results => {
            if (type == 'strategic-kpis'){
                let stratContainer = document.getElementById('strategic-kpi-list-container');
                let addToSelectsPromises = [];
                
                for( let i = 0; i < stratContainer.children.length; i++){
                    addToSelectsPromises.push(addToSelects(`select-strategicKpi${i+1}`, results));
                }
                return Promise.all(addToSelectsPromises);
            }
            return addToSelects(type, results);
        })
        .then(() => {

        })
        .catch(err => {
            console.error(err);
        })
}

/**
 * @description Take the target and remove it from any lists which are related to this list.
 *              Maintain the one to many relation without breaking the function.
 * @param {HTMLElement} target 
 */
function selectedElement(target){
    console.log('target');
}


/**
 * @description Create a new entry box for the user to add more data
 * @param {HTMLElement} target
 * @returns {void}
 */
function createInputSpace(target, nameId){
    // pattern matching everything that is not a number
    let regexNumRemove = /[A-z]+/g;
    let regexNum = /\d+/g;
    //Make sure if there is a relation, it holds before letting the user adding more values.

    // Copy the sibling boxes
    let parent = target.parentElement;
    let nextInputSpace = document.createElement('div');
    parent.classList.forEach(value => nextInputSpace.classList.add(value));
    let matched = parent.id.match(regexNumRemove)[0];
    let nextNum =  parseInt(parent.id.match(regexNum)[0])++;
    nextInputSpace.id = `${matched}${nextNum}`;
    for(let i = 0; i < parent.children.length; i++){
        // Handle the possible input elements
        let element = parent.children[i];
        if (element.value != '' || element.value != 'default'){
            // Error!
            continue;
        }
        if (element.tagName == 'textarea' || element.tagName == 'input'){
            nextInputSpace.appendChild(parent.children[i]);
            nextInputSpace.lastElementChild.value = '';
        } else if (element.tagName == 'select'){
            // fix this element.
        } else {
            
        }
    }
}

function removeInputSpace(target){

}
/**
 * @description Get the information from within the categories container given by the user.
 * @param {HTMLDivElement} element 
 * @returns {Promise<{name: String, data: {projectType: String, vision: String, scope: String}}} 
 */
function getCategoriesContainers(element){
    return new Promise((resolve, reject) => {
        // reject the empty cases!!
        let returnable = {};
        let rejection = false;
        let selects = element.getElementsByTagName('select');
        for(let i = 0; i < selects.length; i++){
            returnable[selects[i].getAttribute('type')] = selects[i].value;
            if(selects[i].value=='default'){
                // popup error
                rejection = true;
            }
        }
        if ( rejection ){
            // Error popups
            reject(new Error('Proper data missing in categories!'));
        } else {
            resolve({name: 'objective', data: returnable.objective});
        }
    });
    
}

/**
 * @description Get the information from within the project name container given by the user.
 * @param {HTMLDivElement} element 
 * @returns {Promise<{name: String, data: {projectType: String, vision: String, scope: String}}}
 */
function getProjectName(element){
    return new Promise((resolve, reject) => {
        // reject the empty cases!!
        let value = element.getElementsByTagName('input')[0].value;
        if (value == ''){
            // Create popup
            reject(new Error('Proper data missing in name!'))
        } else {
            resolve({name: "name", data: value });
        }
    });
}

/**
 * @description Get the information from within the project description container given by the user.
 * @param {HTMLDivElement} element 
 * @returns {Promise<{name: String, data: {projectType: String, vision: String, scope: String}}}
 */
function getProjectDescription(element){
    return new Promise((resolve, reject) => {
        let description = element.getElementsByTagName('textarea')[0].value;
        if ( description == ''){
            // Create popup
            return reject(new Error('Missing project description!'));
        }
        resolve({name: 'description', data: description});
    });
}

/**
 * @description Get the information from within the TypeVisionScope container given by the user.
 * @param {HTMLDivElement} element 
 * @returns {Promise<{name: String, data: {projectType: String, vision: String, scope: String}}}
 */
function getTypeVisionScope(element){
    return new Promise((resolve, reject) => {
        let returnable = {};
        // Handle empty here
        console.log(element);
        let value =  element.getElementsByTagName('select')[0].value;
        console.log('Before 1st Rejection getBudget')
        if (value == 'default'){
            return reject(new Error('Proper data missing in type! Default is not ok!'))
        }
        returnable.projectType = value;
        let text = element.getElementsByTagName('textarea');
        // push errors!
        console.log('Before 2nd Rejection getBudget')
        if (text[0].value == '' && text[1].value == ''){
            return reject(new Error('Proper data missing in vision and scope!'));
        } else if (text[0].value == ''){
            return reject(new Error('Proper data missing in vision!'));
        } else if (text[1].value == ''){
            return reject(new Error('Proper data missing in scope!'));
        }
        returnable.vision = text[0].value;
        returnable.scope = text[1].value;
        resolve({name: 'tvs', data: returnable});
    });
}

/**
 * 
 * @param {HTMLDivElement} element 
 */
function getOwner(element) {
    return new Promise((resolve, reject) => {
        // Get the proper element from the start of the box.
        element = element.getElementsByTagName('div')[0].getElementsByTagName('select')[0]; 
        console.log('Before Rejection getBudget')
        if ( element.value == 'default'){
            return reject(new Error("Default value for owner!"))
        }
        resolve({name:"owner", data: element.value});
    });
}

/**
 * @description Gets the information from within the supporters container given by the user.
 * @param {HTMLDivElement} supportersInput
 * @returns {Promise<{name: String, data: Array<{id: Number, role: String}>}}
 */
function getSupporters(supportersInput){
    return new Promise((resolve, reject) => {
        supportersInput = supportersInput.getElementsByTagName('div')[1].children;
        console.log(supportersInput);
        let supporters = [];
        let rejection = false;
        for (let i = 0; i < supportersInput.length; i++){
            // reject eveyr element that is empty
            let sSelect = supportersInput[i].getElementsByTagName('select')[0].value;
            let role = supportersInput[i].getElementsByTagName('textarea')[0].value;
            if (sSelect != 'default' && role !=''){
                supporters.push({id: sSelect, role: role});
            } else {
                // push popup
                console.log('Error: Missing input for supporter!');
                rejection = true;
            }
        }
        
        console.log('Before Rejection getSupporters')
        if ( rejection || supporters.length == 0 ){
            return reject(new Error('Missing input for supporters'));
        }
        resolve({name: 'supporters', data: supporters});
    });
}

/**
 * @description Get the information from within the container given by the user.
 * @param {HTMLElement} container 
 * @param {String} type 
 * @param {String} name
 * @returns {Promise<{name: String, data: Array<any>}}
 */
function getInputFromLists(container, type, name){
    return new Promise((resolve, reject) => {
        // get the container holding the strategic KPI
        let nonValue = type=='select'?'default':'';
        let inputs = container.children;
        let list = [];
        let rejection = false;
        for (let i = 0; i < inputs.length; i++){
            let inputSelect = inputs[i].getElementsByTagName(type);
            if (inputSelect[0].value == nonValue){
                rejection = true;
                console.log("Error: first input cannot be default!");
            } else if (name == 'stakeholders'){
                list.push({id: inputSelect[0].value, type: inputSelect[0].getAttribute('type')});
            } else {
                list.push(inputSelect[0].value);
            }
        }
        
        console.log('Before Rejection getInputFromList')
        if ( rejection || list.length == 0 ){
            return reject(new Error(`Missing input for ${name}`));
        }
        resolve({name: name, data: list});
    });
}

/**
 * @description Get the information from within the milestones container given by the user.
 * @param {HTMLDivElement} container
 * @returns {Promise<{name: String, data: Array<JSON>}}
 */
function getMilestones(container){
    return new Promise((resolve, reject) => {
        let inputs = container.children;
        let milestones = [];
        let rejection = false;
        for (let i = 0; i < inputs.length; i++){
            let txt = inputs[i].getElementsByTagName('textarea')[0];
            let dates =  inputs[i].getElementsByTagName('input');
            if (txt.value == '' || dates[0].value == '' || dates[1].value == ''){
                rejection = true;
                console.log("Error: first input cannot be default!");
            } else {
                milestones.push({
                    id: i,
                    start: dates[0].value,
                    deadline: dates[1].value,
                    desc: txt.value
                });
            }
        }

        if ( rejection || milestones.length == 0 ){
            return reject(new Error('Missing input for milestones'));
        }
        resolve({name: 'milestones', data: milestones});
    });
}

/**
 * @description Gets the information within the budget container.
 * @param {HTMLDivElement} container 
 * @returns {Promise<{name: String, data: {amount: Number, breakdown: Array<JSON>}>}}
 */
function getBudget(container){
    return new Promise((resolve, reject) => {
        let bbdContainer = container.children.namedItem('budget-breakdown-container').getElementsByClassName('input-budget-breakdown');
        let totalBudget = container.children.namedItem('total-budget').getElementsByTagName('input')[0].value;
        let rejection = false;
        if (totalBudget == 0){
            rejection = true;
            console.log("Error: Need budget information!");
        }
        let budget = new Budget(0, parseInt(totalBudget));
        for (let i  = 0; i < bbdContainer.length; i++){
            let amount = bbdContainer[i].getElementsByTagName('input')[0].value;
            let txt = bbdContainer[i].getElementsByTagName('textarea')[0].value;
            if (amount == '' ||  txt == ''){
                rejection = true;
                console.log('Error: first element cannot be empty!');
            } else {
                budget.pushToBreakdown({amount: parseInt(amount), desc: txt});
            }
        }
        console.log('Before Rejection getBudget')
        if (rejection){
            return reject(new Error("Error in budget"));
        } else if (!budget.breakdownIsValid()){
            return reject(new Error("Budget breakdown is invalid! Check your math"));
        }
        resolve({name: "budget", data: budget.toJson()});
    });
}
/**
 * @description extracts all the project data out of the page, packing them into a JSON which can be returned.
 * @param {Boolean} isEditor
 * @param {(err: Error, data: JSON)} callback
 * @returns {JSON}
 */
function extractProjectInformaiton(isEditor=false, callback){
    // handle the edit information (top line information)
    let mainContainer = document.getElementById('editor-create').children;
    if(isEditor){
        // extract info.
    }
    // Executing all the extraction concurrently.
    // This will fail on the first error.
    Promise.all([
        getCategoriesContainers(mainContainer.namedItem('categories-container')),
        getProjectName(mainContainer.namedItem('project-name-container')),
        getProjectDescription(mainContainer.namedItem('project-description-container')),
        getTypeVisionScope(mainContainer.namedItem('type-vs-container').children[1]),
        getOwner(mainContainer.namedItem('owners-supporters-container').children[1]),
        getSupporters(mainContainer.namedItem('owners-supporters-container').children[1]),
        getInputFromLists(
            mainContainer.namedItem('strategic-kpi-container').children[1],
            'select',
            'strategicKpi'
        ),
        getInputFromLists(
            mainContainer.namedItem('project-kpi-container').children[1],
            'textarea',
            'projectKpi'
        ),
        getInputFromLists(
            mainContainer.namedItem('stakeholder-container').children[1],
            'select',
            'stakeholders'
        ),
        getMilestones(mainContainer.namedItem('milestone-container').children[1]),
        getBudget(mainContainer.namedItem('budget-container').children[1])
    ])
        .then(results => {
            callback(null, results);
        })
        .catch(err => {
            // Should not ever get here
            callback(err);
        });
}

function testInputs(){
    let mainContainer = document.getElementById('editor-create').children;
    getBudget(mainContainer.namedItem('budget-container').children[1])
        .then(result => {
            console.log(result);
        })
        .catch(err => {
            console.error(err);
        })
}

function createProject(target){
    // Use the target to determine if it is an editor or creator
    extractProjectInformaiton(false, function(err, data) {
        // Use the asynchronous function to retreive and then pass the data to the backend.
        if (err) {
            throw err;
        }
        // Call backend 
        console.log(data);
        // Make the post request
        fetch('/DBApi/create-project',{
            method: "POST",
            body: JSON.stringify({data: data}),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then( response => {
                if (response.status >300 ){
                    throw new Error(response.statusText);
                }
                return response.json();
            })
            .then(response => {
                console.log(response)
            })
            .catch(err => {
                console.error(err)
            })
    });

}