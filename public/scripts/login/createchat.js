import { check, errlog } from './common.min.js';

const errorSound = new Audio('/sounds/error.mp3');

const form = document.getElementById('form');

const maxuser = document.getElementById('maxuser');

maxuser.addEventListener('input', ()=>{
	//$('#rangeValue').text($('#maxuser').val());
	document.getElementById('rangeValue').textContent = maxuser.value;
});

form.addEventListener('submit', async (e) => {
	e.preventDefault();
	if (await check()){
		form.submit();
	}
});

console.log('%ccreatechat.js loaded', 'color: limegreen;');