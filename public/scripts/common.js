"use strict";

const socket = io();

const nextbtn = document.getElementById('next');
const clickSound = new Audio('/sounds/click.mp3');

const form1 = document.getElementById('form1');
const form2 = document.getElementById('form2');
const howto = document.querySelector('.howtouse');
const enter = document.getElementById('enter');


//key format xxx-xxx-xxx-xxx
const keyformat = /^[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}$/;
const usernameformat = /^[a-zA-Z0-9\u0980-\u09FF]{3,20}$/;

let e_users = [];

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
    if(username.length < 3 || username.length > 20){
        errlog('usernameErr', '*Name must be between 3 and 20 characters');
        return false;
    }
    if(!usernameformat.test(username)){
        errlog('usernameErr', '*Cannot contain special charecters or space');
        return false;
    }
    if (e_users.includes(username)){
        errlog('usernameErr', 'Username exists <i class="fa-solid fa-triangle-exclamation" style="color: orange;"></i>');
        return false;
    }
    if (!checked){
        errlog('avatarErr', '*Avatar is required');
        return false;
    }
    return checked;
}

function check(){
    document.querySelectorAll('.errLog')
    .forEach(elem => {
        elem.textContent = '';
    });
    if (validateKey() && validateUser()){
        document.getElementById('enter').innerHTML = `Please Wait <i class="fa-solid fa-circle-notch fa-spin"></i>`;
    }
    return validateKey() && validateUser();
}

function errlog(id, msg){
    let err = document.getElementById(id);
    err.innerHTML = msg;
}

function wait(){
    let wait = document.getElementById('wait');
    wait.style.display = 'flex';
}

//set css variables
document.documentElement.style.setProperty('--height', window.innerHeight + 'px');

window.addEventListener('offline', function(e) { 
    console.log('offline'); 
    document.querySelector('.offline').textContent = 'You are offline!';
    document.querySelector('.offline').classList.add('active');
    document.querySelector('.offline').style.background = 'orangered';
});

window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

window.addEventListener('online', function() {
    console.log('Back to online');
    document.querySelector('.offline').textContent = 'Back to online!';
    document.querySelector('.offline').style.background = 'limegreen';
    setTimeout(() => {
        document.querySelector('.offline').classList.remove('active');
    }, 1500);
});

if ('serviceWorker' in navigator){
    window.addEventListener('load', () => {
        navigator.serviceWorker
        .register('./serviceWorkerPoketabS.min.js')
        .then(reg => console.log("Service Worker Registered"))
        .catch(err => console.log(`Service Worker: Error ${err}`));
    });
}


document.querySelectorAll('.clickable').forEach(elem => {
    elem.addEventListener('click', () => {
        clickSound.currentTime = 0;
        clickSound.play();
    });
});