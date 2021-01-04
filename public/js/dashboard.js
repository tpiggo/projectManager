/**
 * 
 * @param {Event} event 
 * @param {HTMLElement} target 
 */
function createUser(event, target){
    let body = target.parentElement.previousElementSibling;
    let userInfo = getInput(body);
    let inputElements = body.getElementsByTagName('input');
    let errorMessage = false;
    Object.keys(userInfo).forEach(value => {
        if ( value ==  'confirmPass' && userInfo.pass != userInfo[value]){
            createErrorPopup(
                'Passwords do not match!', 
                inputElements.namedItem(value).parentElement
            );
            errorMessage = true;
        }
        if ( userInfo[value] == ''){
            createErrorPopup(
                'Cannot be empty!',
                inputElements.namedItem(value).parentElement
            );
            errorMessage = true;
        }

    });
    if (errorMessage){
        createErrorPopup("Please fix the errors on the page!", body.previousElementSibling, 'red');
        return;
    }
    // Create the user!
    fetch('/DBApi/create-user', {
        method: 'POST',
        body: JSON.stringify(userInfo),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(async (response) => {
            console.log(response);
            if (response.status > 300){
                let data = await response.json();
                console.log(data);
                throw Error(data.errorMessage);
            }
            return response.json()
        })
        .then(() => createSuccessPopup('User created!', body.previousElementSibling))
        .catch(err =>{
            console.log(err);
            createErrorPopup('Something went wrong!', body.previousElementSibling, 'red');
        });
}

/**
 * 
 * @param {HTMLElement} body 
 */
function getInput(body){
    let info = {};
    let input = body.getElementsByTagName('input');
    input.namedItem
    for (let i = 0; i < input.length; i++){
        info[input[i].id] = input[i].value;
    }
    return info;
}

/**
 * 
 * @param {Event} event 
 * @param {HTMLElement} target 
 */
function updateUser(event, target){
    let userInfo = getInput(target);
}

/**
 * 
 * @param {HTMLElement} target 
 */
function getUser(target){

}