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

function remainingTime(totalTime, elapsedTime) {
	// Calculate the remaining time
	const remaining = Math.floor(totalTime) - Math.floor(elapsedTime);
	// Calculate the minutes and seconds
	const minutes = Math.floor(remaining / 60);
	const seconds = Math.floor(remaining % 60);	
	// Return the remaining time in the format "00:00"
	return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
}

const timerElem = document.querySelector('.remainingTime');
let elapsedTime = 1;
let addedShake = false;
const timeCount = 20;
let timer = setInterval(() => {
	if ((elapsedTime >= timeCount - 10) && !addedShake){
		timerElem.classList.add('shake');
		timerElem.style.color = '#ff2a20';
		addedShake = true;
	}
	if (elapsedTime >= timeCount){
		errorSound.play();
		timerElem.classList.remove('shake');
		const btn = document.getElementById('enter');
		btn.innerHTML = 'Renew session <i class="fa-solid fa-rotate-right"></i>';
		btn.style.background = '#ff2a20';
		clearInterval(timer);
		timer = undefined;
		errlog('usernameErr', 'Session expired <i class="fa-solid fa-triangle-exclamation"></i>');
		btn.onclick = () => {
			btn.innerHTML = 'Please wait <i class="fa-solid fa-rotate-right fa-spin"></i>';
			location.reload();
		};
	}
	timerElem.textContent = remainingTime(timeCount, elapsedTime++);
}, 1000);

console.log('%ccreatechat.js loaded', 'color: limegreen;');