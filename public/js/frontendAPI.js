

function navBarOnClick(event, target){
    console.log("clicked me")
}

function fetchBackend(pOpts){
    fetch('/DBApi/test-connection')
        .then(response => response.json())
        .then(result => {
        console.log('Success:', result);
        })
        .catch(err => console.error('Error', err));
}