'use strict';

export const clickSound = new Audio('/sounds/click.mp3');

export const usernameformat = /^[a-zA-Z0-9_\u0980-\u09FF]{3,20}$/;

let errTimeout = undefined;

/**
 * 
 * @param {string} id errorId
 * @param {string} msg error message
 */
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

const enter = document.getElementById('enter');
enter.removeAttribute('disabled');
enter.style.cursor = 'pointer';

if ('serviceWorker' in navigator){
	window.addEventListener('load', () => {
		//if service worker is already registered, skip
		if (navigator.serviceWorker.controller){
			console.log('%cService Worker already registered', 'color: orange;');
			return;
		}
		navigator.serviceWorker
			.register('./serviceWorkerPoketabS.js', {scope: './'})
			.then(() => {
				console.log('%cService Worker Registered', 'color: deepskyblue;');
			})
			.catch(err => console.log(`Service Worker: Error ${err}`));
	});
}

console.log('%ccommon.js loaded', 'color: limegreen;');