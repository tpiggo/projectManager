/**
 * @description Calling the backend to get data from the specified URL with formatted string
 * @param {Event} event 
 * @param {HTMLElement} target 
 * @param {Number} id 
 */
function clickableElement(event, target, id){
    // Create URL for fetching backend data using Fetch API
    let type = target.getAttribute('type');
    let url = `/DBApi/get-${type}?${type}id=${id}`
    fetch(url)
        .then(response => response.json())// parse the body to a json
        .then(result =>{
            console.log("response", result);// use the result
        })
        .catch(err=>console.error(err));
}
/**
 * @description Test the connection to the backend
 */
function testConnectionWithDB(){
    fetch('/DBApi/test-connection')
        .then(response => response.json())
        .then(result => {
        console.log('Success:', result);
        })
        .catch(err => console.error('Error', err));
}