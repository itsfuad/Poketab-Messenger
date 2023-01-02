import { check } from '/scripts/common.js';

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