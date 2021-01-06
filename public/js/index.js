/**
 * @todo Create the CRUD
 */


 /**
  * @description Get the CRUD from the backend. Given there are two, we get the specific one.
  *              Response is HTML therefore, we return an 
  * @param {URL} url 
  * 
  */
 function fetchCRUD(url){
    return new Promise((resolve, reject) => {
        fetch(url)
        .then(response => {
            if (response.status == 400){
                throw Error("You do not have access!");
            } else if (response.staus > 300){
                throw Error("Something went wrong!");
            }
            return response.json();
        })
        .then(response => {
            resolve(response);
        }).catch(err => {
            reject(err);
        });
    });
}

/**
 * @description Change the main container to the editor, done asynchronously. 
 * @param {{html: String, scripts: Array<{pathToScript: URL, onload: String}>}} data
 */
function loadEditor({html, scripts}){
    return new Promise((resolve)=>{
        console.log(scripts);
        let main = document.getElementById('main-container');
        removeChildren(main, 0);
        main.innerHTML = html;
        let loadScripts = []
        scripts.forEach(value => {
            loadScriptFile(value.pathToScript, function(){
                window[value.onload]();
            });
        });
        resolve(loadScripts);
    });
}

/**
 * @description Load functions dynamically asynchronously 
 * @param {String} pathToFile 
 * @param {Function} callBack 
 */
function loadScriptFile(pathToFile, callback){
    var scriptTag = document.createElement("script"); //creates a HTML script element
    scriptTag.type = "text/javascript";
    scriptTag.src = pathToFile; //the source
    var scriptTagParent = document.getElementsByTagName("script")[0];
    if (scriptTagParent) {
            scriptTagParent.parentNode.insertBefore(scriptTag, scriptTagParent);
            console.log('appended before', scriptTagParent);
    } else  {
        document.body.appendChild(scriptTag);
        console.log('appended to body');
    } if (callback){
        scriptTag.onload = callback; //when loaded execute call back
    }
}

/**
 * @description Edit the projects. Either edits the first project or the current project within the frame or the first project
 * @param {HTMLElement} target
 */
function editProjectEditor(target){
    fetchCRUD('/fetchable/Editor')
        .then(result => {
            // The response is a JSON
            console.log(result);
            return loadEditor(result);
        })
        .then((results) =>{
            console.log("Creator Ready!");
            // Lock creator button
            target.classList.add('disabled');
            results.forEach(value => {
                console.log(window, window[value], value);
            });
        })
        .catch(err => {
            // Create error popup
            console.error(err);
        })
}


/**
 * @description Create new projects
 * @param {HTMLElement} target
 */
function createProjectEditor(target){
    let main = document.getElementById('main-container'); 
    if (main.children.namedItem('editor-create')){
        // Do not allow reloading of the element while it is shown.
        return;
    }
    fetchCRUD('/fetchable/Creator')
        .then(result => {
            // The response is a JSON
            console.log(result);
            return loadEditor(result);
        })
        .then((results) =>{
            console.log("Creator Ready!");
            // Lock creator button
            target.classList.add('disabled');
        })
        .catch(err => {
            // Create error popup
            console.error(err);
        });
}