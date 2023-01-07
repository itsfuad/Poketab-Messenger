'use strict';

const clickSound = new Audio('/sounds/click.mp3');

const usernameformat = /^[a-zA-Z0-9\u0980-\u09FF]{3,20}$/;

async function validateUser(hashes = null){

	const username = document.getElementById('username').value;
	const avatars = document.querySelectorAll('.avatar input[type="radio"]');

	let checked = false;

	for (let i = 0; i < avatars.length; i++){
		if (avatars[i].checked){
			checked = true;
			break;
		}
	}

	if (hashes){

		const encodedText = new TextEncoder().encode(username);
		const hashBuffer = await crypto.subtle.digest('SHA-256', encodedText);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

		if (hashes.includes(hashHex)){
			errlog('usernameErr', 'Username taken <i class="fa-solid fa-triangle-exclamation"></i>');
			return false;
		}
	}

	if (username.length == 0){
		document.getElementById('username').focus();
		errlog('usernameErr', 'Username is required <i class="fa-solid fa-triangle-exclamation"></i>');
		return false;
	}
	if(username.length < 3 || username.length > 20){
		document.getElementById('username').focus();
		errlog('usernameErr', 'Name must be between 3 and 20 characters <i class="fa-solid fa-triangle-exclamation"></i>');
		return false;
	}
	if(!usernameformat.test(username)){
		document.getElementById('username').focus();
		errlog('usernameErr', 'Cannot contain special charecters or space <i class="fa-solid fa-triangle-exclamation"></i>');
		return false;
	}
	if (!checked){
		errlog('avatarErr', 'Avatar is required <i class="fa-solid fa-triangle-exclamation"></i>');
		return false;
	}
	return checked;
}

export async function check(hashes = null){
	document.querySelectorAll('.errLog')
		.forEach(elem => {
			elem.textContent = '';
		});
	const valid = await validateUser(hashes);
	if (valid){
		document.getElementById('enter').innerHTML = 'Please Wait <i class="fa-solid fa-circle-notch fa-spin"></i>';
	}
	return valid;
}

let errTimeout = undefined;

export function errlog(id, msg){
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
				console.log('%cService Worker Registered', 'color: orange;');
			})
			.catch(err => console.log(`Service Worker: Error ${err}`));
	});
}

document.getElementById('redirect').onclick = wait;
const help = document.getElementById('help');
help.addEventListener('click', () => {
	document.getElementById('helpExpanded').classList.toggle('active');
	if (help.querySelector('i').classList.contains('fa-circle-question')){
		help.querySelector('i').classList.replace('fa-circle-question', 'fa-circle-xmark');
		help.querySelector('i').style.color = '#f33636';
	}else{
		help.querySelector('i').classList.replace('fa-circle-xmark', 'fa-circle-question');
		help.querySelector('i').style.color = '#4598ff';
	}
});

document.querySelectorAll('.clickable').forEach(elem => {
	elem.addEventListener('click', () => {
		clickSound.currentTime = 0;
		clickSound.play();
	});
});

console.log('%ccommon.js loaded', 'color: limegreen;');