var pw = document.getElementById('pw');
var un = document.getElementById('un');

function performLogin(){
    body = {username: un.value, password: pw.value};
    console.log(body);
    fetch('/login', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(json => {
            console.log(json)
            if (json.status == 1){
                window.location.href = '/dashboard';
            } else {
                // Create error on page
            }
        })
        .catch(err => console.error(err))
}

un.addEventListener('keypress', function (e) {
    if (e.key == 'Enter'){
        // Check if the other has been entered
        performLogin();
    }
});

pw.addEventListener('keypress', function (e) {
    if (e.key == 'Enter'){
        // Check if the other has been entered
        performLogin();
    }
});