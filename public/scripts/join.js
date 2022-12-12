/* eslint-disable no-undef */
'use strict';

nextbtn.addEventListener('click', nextbtnEvent);

function nextbtnEvent(e){
	e.preventDefault();
	document.querySelectorAll('.errLog')
		.forEach(elem => {
			elem.textContent = '';
		});
	if (validateKey()){   
		const key = document.getElementById('key').value;
		socket.emit('joinRequest', key, function(err){
			if (err){
				errlog('keyErr', 'Unauthorised <i class="fa-solid fa-triangle-exclamation" style="color: orange;"></i>');
				document.getElementById('label').childNodes[0].textContent = 'Chat Key ';
				document.getElementById('lb__icon').className =  'fa-solid fa-key';
			}
		});
		document.getElementById('label').childNodes[0].textContent = 'Checking ';
		document.getElementById('lb__icon').className =  'fa-solid fa-circle-notch fa-spin';
	}
}


socket.on('joinResponse', (data) => {
	document.getElementById('label').childNodes[0].textContent = 'Chat Key ';
	document.getElementById('lb__icon').className =  'fa-solid fa-key';
	if (!data.exists){
		errlog('keyErr', 'Key does not exists <i class="fa-solid fa-ghost" style="color: whitesmoke;"></i>');
	}else{
		e_users = data.userlist || [];
		const e_avatars = data.avatarlist || [];
		if (e_avatars){
			e_avatars.forEach(avatar => {
				//* delete if works
				document.querySelector(`label[for='${avatar}']`).style.display = 'none';
			});
		}
		form1.style.display = 'none';
		form2.classList.add('active');
		howto.style.display = 'none';
		document.querySelector('.footer').style.display = 'none';
		document.getElementsByTagName('body')[0].style.justifyContent = 'center';
	}
});