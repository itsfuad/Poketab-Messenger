/* eslint-disable no-undef */
'use strict';

const errorSound = new Audio('/sounds/error.mp3');

maxuser.addEventListener('input', ()=>{
	//$('#rangeValue').text($('#maxuser').val());
	document.getElementById('rangeValue').textContent = maxuser.value;
});

nextbtn.addEventListener('click', nextbtnEvent);

function expiredEvent(err){
	document.getElementById('label').childNodes[0].textContent = 'Tap to copy ';
	document.getElementById('lb__icon').className =  'fa-regular fa-clone';
	document.getElementById('key').style.color = '#e74945';
	errlog('keyErr', `${err} <i class="fa-solid fa-triangle-exclamation" style="color: orange;"></i>`);
	errlog('usernameErr', `${err} <i class="fa-solid fa-triangle-exclamation" style="color: orange;"></i>`);
	const fragment = document.createDocumentFragment();
	const i = document.createElement('i');
	i.className = 'fa-solid fa-arrows-rotate';
	fragment.appendChild(i);
	nextbtn.textContent = 'Reload';
	nextbtn.style.backgroundColor = '#e33937';
	enter.textContent = 'Reload';
	enter.type = 'button';
	enter.onclick = ()=>{
		location.reload();
	};
	enter.style.background = '#e33937';
	nextbtn.appendChild(fragment);
	nextbtn.removeEventListener('click', nextbtnEvent);
	nextbtn.addEventListener('click', ()=>{
		location.reload();
	});
}

function nextbtnEvent(e){
	e.preventDefault();
	if (validateKey()){   
		let key = document.getElementById('key').value;
		socket.emit('createRequest', key, function(err){
			if (err){
				expiredEvent(err);
			}
		});
		document.getElementById('label').style.color = '#fff';
		document.getElementById('label').childNodes[0].textContent = 'Checking ';
		document.getElementById('lb__icon').className =  'fa-solid fa-circle-notch fa-spin';
	}
}

function countDown(){
	//count down for two minutes
	let count = 120;
	let min, sec;
	let interval = setInterval(()=>{
		count--;
		if (count <= 0){
			min = '00';
			sec = '00';
			clearInterval(interval);
			expiredEvent('Key expired');
			errorSound.currentTime = 0;
			errorSound.play();
			navigator.vibrate(1000);
			document.getElementsByClassName('remainingTime')[0].classList.remove('shake');
			document.getElementsByClassName('remainingTime')[1].classList.remove('shake');
			document.getElementsByClassName('remainingTime')[0].textContent = `${min}:${sec}`;
			document.getElementsByClassName('remainingTime')[1].textContent = `${min}:${sec}`;
			return;
		}else if(count <= 10){
			document.getElementsByClassName('remainingTime')[0].style.color = '#e33937';
			document.getElementsByClassName('remainingTime')[1].style.color = '#e33937';
			document.getElementsByClassName('remainingTime')[0].classList.add('shake');
			document.getElementsByClassName('remainingTime')[1].classList.add('shake');
		}
		//convert to mm:ss
		min = Math.floor(count/60);
		sec = count%60;
		if (min < 10){
			min = '0' + min;
		}
		if (sec < 10){
			sec = '0' + sec;
		}
		document.getElementsByClassName('remainingTime')[0].textContent = `${min}:${sec}`;
		document.getElementsByClassName('remainingTime')[1].textContent = `${min}:${sec}`;
	}, 1000);
}

document.querySelector('.copy').addEventListener('click', ()=>{
	let key = document.getElementById('key').value;
	navigator.clipboard.writeText(`${location.origin}/join/${key}`);
	document.getElementById('label').style.color = 'limegreen';
	document.getElementById('label').childNodes[0].textContent = 'Copied ';
	document.getElementById('lb__icon').className =  'fa-solid fa-check';
	setTimeout(()=>{
		document.getElementById('label').style.color = '#fff';
		document.getElementById('label').childNodes[0].textContent = 'Tap to copy ';
		document.getElementById('lb__icon').className =  'fa-regular fa-clone';
	}, 1000);

});

socket.on('createResponse', (data) => {
	document.getElementById('label').childNodes[0].textContent = 'Chat Key ';
	document.getElementById('lb__icon').className =  'fa-solid fa-key';
	if (!data.exists){
		form1.style.display = 'none';
		form2.classList.add('active');
		howto.style.display = 'none';
		document.querySelector('.footer').style.display = 'none';
		document.getElementsByTagName('body')[0].style.justifyContent = 'center';
	}else{
		errlog('keyErr', 'Key does already exists <i class="fa-solid fa-triangle-exclamation" style="color: orange;"></i>');
	}
});

countDown();