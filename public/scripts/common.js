let nextbtn = document.getElementById('next');

let form1 = document.getElementById('form1');
let form2 = document.getElementById('form2');
let howto = document.querySelector('.howtouse');
let enter = document.getElementById('enter');

const key = document.getElementById('key').value;

//key format xxx-xxx-xxx-xxx
const keyformat = /^[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}$/;
const usernameformat = /^[a-zA-Z0-9]{3,20}$/;


function validateKey(){
    let key = document.getElementById('key').value;
    if(key.length == 0){
        errlog('keyErr', '*Key is required');
        return false;
    }
    if(!keyformat.test(key)){
        errlog('keyErr', '*Key is not valid');
        return false;
    }
    return true;
}

function validateUser(){
    let username = document.getElementById('username').value;
    let radios = document.getElementsByName('avatar');
    let checked = false;
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            checked = true;
            break;
        }
    }
    if (username.length == 0){
        errlog('usernameErr', '*Username is required');
        return false;
    }
    if(!usernameformat.test(username)){
        errlog('usernameErr', '*Username is not valid (Cannot contain special charecters or space');
        return false;
    }
    if (!checked){
        errlog('avatarErr', '*Avatar is required');
        return false;
    }
    return true;
}

function errlog(id, msg){
    let err = document.getElementById(id);
    err.innerHTML = msg;
}

