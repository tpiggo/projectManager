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
            let chainedPromises = [];
            for (let i = 0; i < results.length; i++){
                if (get[i] == "types"){
                    chainedPromises.push(addToSelects('projectTypes', results[i]));
                } else if (get[i] == 'departments'){
                    chainedPromises.push(addToSelects('owner', results[i]));
                    chainedPromises.push(addToSelects('supporters', results[i]));
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
        let element = document.getElementById(elementId)
        list.forEach(value => {
            let inner = '';
            if (elementId == 'stakeholders'){
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