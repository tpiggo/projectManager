
class PriorityButton {
    pid;
    id;
    element;
    constructor(id, pid){
       this.id = id;
       this.element = document.getElementById(id)
       this._addListener()
    }
    onClick(event){
        let url = `/DBApi/get-priority?id=${this.id}`
        fetch(url)
            .then(response => response.json())// parse the body to a json
            .then(result =>{
                console.log("response", result);// use the result
            })
            .catch(err=>console.error(err));
    }
    _addListener(){
        element.addEventListener(this.onClick(event));
    }
}

module.exports = {PriorityButton};