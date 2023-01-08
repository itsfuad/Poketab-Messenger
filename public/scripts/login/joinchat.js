import { check, errlog } from './common.min.js';

// eslint-disable-next-line no-undef
const socket = io('/auth');

socket.on('connect', () => {
	console.log('%cConnected to auth namespace', 'color: deepskyblue;');
});

const form = document.getElementById('form');
const next = document.getElementById('next');
const form1 = document.getElementById('subform1');
const form2 = document.getElementById('subform2');

export const hashes = [];

const keyformat = /^[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}$/;

function validateKey(){
	const key = document.getElementById('key').value;
	if(key.length == 0){
		document.getElementById('key').focus();
		errlog('keyErr', 'Key is required <i class="fa-solid fa-triangle-exclamation"></i>');
		document.getElementById('keyLabel').innerHTML = 'Enter key <i id=\'lb__icon\' class="fa-solid fa-key"></i>';
		return false;
	}
	if(!keyformat.test(key)){
		document.getElementById('key').focus();
		errlog('keyErr', 'Key is not valid <i class="fa-solid fa-triangle-exclamation"></i>');
		document.getElementById('keyLabel').innerHTML = 'Enter key <i id=\'lb__icon\' class="fa-solid fa-key"></i>';
		return false;
	}
	return true;
}

form.addEventListener('submit', async (e) => {
	e.preventDefault();
	if ( validateKey() && await check(hashes)){
		form.submit();
	}
});

//click on the next button when enter pressed on document.getElementById('key')
const keyElem = document.getElementById('key');

['paste', 'keydown'].forEach(event => {
	keyElem.addEventListener(event, (e) => {
		if (e.key === 'Enter'){
			e.preventDefault();
			next.click();
		}
		//for paste event
		if (e.type === 'paste'){
			setTimeout(() => {
				next.click();
			}, 100);
		}
	});
});

next.addEventListener('click', (e) => {
	e.preventDefault();
	document.getElementById('keyLabel').innerHTML = 'Checking <i id=\'lb__icon\' class="fa-solid fa-circle-notch fa-spin"></i>';
	if (validateKey()){
		const key = document.getElementById('key').value;
		socket.emit('joinRequest', key, (response) => {
			document.getElementById('keyLabel').innerHTML = 'Enter key <i id=\'lb__icon\' class="fa-solid fa-key"></i>';
			if (response.success){
				const usersData = response.message;
				//remove existing avatars
				usersData.forEach(userData => {
					const avatar = document.getElementById(userData.avatar);
					avatar.closest('.avatar').querySelector('img').classList.add('taken');
					avatar.remove();
					hashes.push(userData.hash);
				});

				form1.classList.add('done');
				form2.classList.add('active');
			}else{
				errlog('keyErr', `${response.message} <i class="fa-solid fa-ghost"></i>`);
			}
		});
	}
});

console.log('%cjoinchat.js loaded', 'color: limegreen;');