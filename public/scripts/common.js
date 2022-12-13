'use strict';

// eslint-disable-next-line no-undef
const socket = io('/auth');

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
	const key = document.getElementById('key').value;
	if(key.length == 0){
		document.getElementById('key').focus();
		errlog('keyErr', '*Key is required');
		return false;
	}
	if(!keyformat.test(key)){
		document.getElementById('key').focus();
		errlog('keyErr', '*Key is not valid');
		return false;
	}
	return true;
}

function validateUser(){
	const username = document.getElementById('username').value;
	const radios = document.getElementsByName('avatar');
	let checked = false;
	for (var i = 0; i < radios.length; i++) {
		if (radios[i].checked) {
			checked = true;
			break;
		}
	}
	if (username.length == 0){
		document.getElementById('username').focus();
		errlog('usernameErr', '*Username is required');
		return false;
	}
	if(username.length < 3 || username.length > 20){
		document.getElementById('username').focus();
		errlog('usernameErr', '*Name must be between 3 and 20 characters');
		return false;
	}
	if(!usernameformat.test(username)){
		document.getElementById('username').focus();
		errlog('usernameErr', '*Cannot contain special charecters or space');
		return false;
	}
	if (e_users.includes(username)){
		document.getElementById('username').focus();
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
		document.getElementById('enter').innerHTML = 'Please Wait <i class="fa-solid fa-circle-notch fa-spin"></i>';
	}
	return validateKey() && validateUser();
}

let errTimeout = undefined;

function errlog(id, msg){
	const err = document.getElementById(id);
	err.innerHTML = msg;
	err.classList.add('shake');
	if (errTimeout == undefined){
		errTimeout = setTimeout(()=>{
			err.classList.remove('shake');
			errTimeout = undefined;
		}, 500);
	}
}

document.getElementById('form').onsubmit = check;

document.getElementById('redirect').onclick = wait;

function wait(){
	const wait = document.getElementById('wait');
	wait.style.display = 'flex';
}

//set css variables
document.documentElement.style.setProperty('--height', window.innerHeight + 'px');

window.addEventListener('offline', function() { 
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
			.then(() => {
				console.log('Service Worker Registered');
			})
			.catch(err => console.log(`Service Worker: Error ${err}`));
	});
}


document.querySelectorAll('.clickable').forEach(elem => {
	elem.addEventListener('click', () => {
		clickSound.currentTime = 0;
		clickSound.play();
	});
});