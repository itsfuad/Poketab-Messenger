//enable strict mode
'use strict';

import {io} from '../../libs/socket.io.js';
import { 
	myName, 
	myId, 
	myAvatar, 
	myKey, 
	maxUser, 
	userTypingMap, 
	setTypingUsers,
	popupMessage,
	loadStickerHeader,
	loadStickers,
	userInfoMap,
	isTyping,
	joinsound,
	leavesound,
	locationsound,
	serverMessage,
	insertNewMessage,
	notifyUser,
	checkgaps,
	updateScroll,
	getReact,
	deleteMessage,
	playTypingSound,
	playIncomingSound,
	playStickerSound,
	messageSoundEnabled,
} from './app.js';
//main socket to deliver messages
export const socket = io(); 

//sockets
socket.on('connect', () => {
	console.log('%cConnection established to message relay server', 'color: deepskyblue;');
	const params = {
		name: myName,
		id: myId,
		avatar: myAvatar,
		key: myKey,
		maxUser: maxUser,
	};
	socket.emit('join', params, function(err){
		if (err) {
			console.log(err);
			document.getElementById('preload').innerHTML = `${err} <i class="fa-solid fa-ghost"></i>`;
			popupMessage('Self destruction in 5 seconds!');
			setTimeout(() => {
				document.body.remove();
				location.reload();
			}, 5000);
		} else {
			console.log('%cNo errors!', 'color: limegreen;');
			if (userTypingMap.size > 0){
				setTypingUsers();
			}
			document.getElementById('preload').style.display = 'none';
			popupMessage('Connected to message relay server');
			loadStickerHeader();
			loadStickers();
			if ('Notification' in window){
				Notification.requestPermission();
			}else{
				popupMessage('Notifications not supported by your browser');
			}
		}
	});
});
//updates current user list
socket.on('updateUserList', (users) => {

	users.forEach(user => {
		userInfoMap.set(user.uid, user);
	});
	if(isTyping){
		socket.emit('typing');
	}
	document.getElementById('count').textContent = `${users.length}/${maxUser}`;
	while (document.getElementById('userlist').firstChild) {
		document.getElementById('userlist').removeChild(document.getElementById('userlist').firstChild);
	}
	users.forEach(user => {
		const listItem = document.createElement('li');
		listItem.classList.add('user');
		listItem.setAttribute('data-uid', user.uid);
		const avt = document.createElement('div');
		avt.classList.add('avt');
		const img = document.createElement('img');
		img.src = `/images/avatars/${user.avatar}(custom).png`;
		img.height = 30;
		img.width = 30;
		const status = document.createElement('i');
		status.classList.add('fa-solid', 'fa-circle', 'activeStatus');
		avt.appendChild(img);
		avt.appendChild(status);
		const userSpan = document.createElement('span');
		userSpan.textContent = user.uid == myId ? user.username + ' (You)' : user.username;
		listItem.append(avt, userSpan);
		if (user.uid == myId){
			document.getElementById('userlist').prepend(listItem);
		}else{
			document.getElementById('userlist').appendChild(listItem);
		}
	});
});

socket.on('server_message', (meta, type) => {
	if (messageSoundEnabled){
		switch (type) {
		case 'join':
			joinsound.play();
			break;
		case 'leave':
			leavesound.play();
			break;
		case 'location':
			locationsound.play();
			break;
		}
	}
	serverMessage(meta, type);
});

socket.on('newMessage', (message, type, id, uid, reply, replyId, options) => {
	if (type == 'text'){
		playIncomingSound();
	}else if(type == 'sticker'){
		playStickerSound();
	}
	insertNewMessage(message, type, id, uid, reply, replyId, options, {});
	notifyUser({data: type == 'text' ? message : '', type: type[0].toUpperCase()+type.slice(1)}, userInfoMap.get(uid)?.username, userInfoMap.get(uid)?.avatar);
});

socket.on('seen', meta => {
	const message = document.getElementById(meta.messageId);
	const isMessage = message?.classList?.contains('message');
	if (message && isMessage && !message.dataset.seen?.includes(meta.userId)){
		document.querySelectorAll(`.msg-item[data-seen*="${meta.userId}"]`)
			.forEach(elem => {
				if (elem != null){
					elem.querySelector(`.seenBy img[data-user="${meta.userId}"]`)?.remove();
					if (elem.querySelector('.seenBy').childElementCount < 2){
						//console.log('Resetting gap');
						elem.closest('.message').classList.remove('seenByMultiple');
					}
					checkgaps(elem.id);
				}
			});

		message.dataset.seen = message.dataset.seen ? message.dataset.seen + '|' + meta.userId : meta.userId;
		const element = document.createElement('img');
		element.src = `/images/avatars/${meta.avatar}(custom)-mini.png`;
		element.dataset.user = meta.userId;
		message.querySelector('.seenBy').appendChild(element);
		if (message.querySelector('.seenBy').childElementCount > 1){
			message.classList.add('seenByMultiple');
		}
		checkgaps(message.id);
		updateScroll();
	}
});

socket.on('getReact', (target, messageId, myId) => {
	getReact(target, messageId, myId);
});

socket.on('deleteMessage', (messageId, userName) => {
	deleteMessage(messageId, userName);
});

socket.on('typing', (user, id) => {
	playTypingSound();
	userTypingMap.set(id, user);
	setTypingUsers();
});
  
socket.on('stoptyping', (id) => {
	userTypingMap.delete(id);
	setTypingUsers();
});

//on disconnect
socket.on('disconnect', () => {
	console.log('%cDisconnected from message relay server.', 'color: red;');
	popupMessage('Disconnected from message relay server');
});