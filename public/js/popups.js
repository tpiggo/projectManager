/**
 * 
 * @param {String} message 
 * @param {HTMLElement} target 
 */
function createSuccessPopup(message, target){
    let div = document.createElement('div');
    div.innerHTML = message;
    div.innerHTML += '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
    div.setAttribute('role', 'alert');
    div.classList.add('alert', 'alert-success', 'alert-dismissible', 'fade', 'show');
    let parent = target.parentElement;
    parent.insertBefore(div, target.nextElementSibling);
}

/**
 * 
 * @param {String} message 
 * @param {HTMLElement} target 
 */
function createErrorPopup(message, target, color='yellow'){
    let div = document.createElement('div');
    div.innerHTML = message;
    div.innerHTML += '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
    div.setAttribute('role', 'alert');
    if (color == 'red'){
        div.classList.add('alert', 'alert-danger', 'alert-dismissible', 'fade', 'show');
    } else {
        div.classList.add('alert', 'alert-warning', 'alert-dismissible', 'fade', 'show');
    }
    let parent = target.parentElement;
    parent.insertBefore(div, target.nextElementSibling);
}