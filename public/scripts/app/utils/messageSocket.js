//enable strict mode
'use strict';

import { io } from './../../../libs/socket.io.js';

import { playJoinSound, playLeaveSound, playLocationSound, playIncomingSound, playStickerSound, playTypingSound } from './media.js';

import { 
	myName, 
	myId, 
	myAvatar, 
	maxUser, 
	myKey, 
	showPopupMessage, 
	deleteMessage, 
	setTypingUsers, 
	isTyping, 
	serverMessage, 
	notifyUser, 
	checkgaps, 
	updateScroll, 
	getReact, 
	insertNewMessage,
	userTypingMap,
	userInfoMap,
	loginTimeout,
	slowInternetTimeout
} from './../app.js';

import { loadStickerHeaders } from './stickersKeyboard.js';

import { fragmentBuilder } from './fragmentBuilder.js';

//main socket to deliver messages
/**
 * @type {SocketIOClient.Socket}
 */
export const chatSocket = io('/chat'); 

//sockets
//When connection is established to message relay server
chatSocket.on('connect', () => {
	console.log('%cConnection established to message relay server', 'color: deepskyblue;');
	//User parameters to join the chat
	const params = {
		name: myName,
		id: myId,
		avatar: myAvatar,
		key: myKey,
		maxUser: maxUser,
	};
	//Emits the join signal with the user parameters
	chatSocket.emit('join', params, function(err){
		//if error, display error message and reload page
		if (err) {
			console.log(err);
			let preload = document.getElementById('preload');
			if (!preload){
				preload = document.createElement('div');
				preload.id = 'preload';
			}

			preload.innerHTML = `${err} <i class="fa-solid fa-ghost"></i>`;

			showPopupMessage('Self destruction in 5 seconds!');
			
			setTimeout(() => {
				document.body.remove();
				window.location = '/';
			}, 5000);
			
		} else {
			console.log('%cNo errors!', 'color: limegreen;');
			//check for the users who are typing
			if (userTypingMap.size > 0){
				setTypingUsers();
			}
			const preload = document.getElementById('preload');
			if (preload){
				preload.remove();
			}
			if (loginTimeout){
				clearTimeout(loginTimeout);
			}
			if (slowInternetTimeout){
				clearTimeout(slowInternetTimeout);
			}

			showPopupMessage('Connected to message relay server');

			//after connection is established, load the stickers
			loadStickerHeaders();
			//ask for notification permission
			if ('Notification' in window){
				//Notification.requestPermission();
				//check if permission is not granted
				if (Notification.permission !== 'granted'){
					//ask for permission
					Notification.requestPermission();
				}
			}else{
				showPopupMessage('Notifications not supported by your browser');
			}
		}
	});
});

//updates current user list when a user joins or leaves
chatSocket.on('updateUserList', (users) => {

	users.forEach(user => {
		userInfoMap.set(user.uid, user);
	});

	if(isTyping){
		chatSocket.emit('typing');
	}

	document.getElementById('count').textContent = `${users.length}/${maxUser}`;
	while (document.getElementById('userlist').firstChild) {
		document.getElementById('userlist').removeChild(document.getElementById('userlist').firstChild);
	}
	users.forEach(user => {
		const listItem = document.createElement('li');
		
		const userFragment = fragmentBuilder(
			{
				tag: 'li',
				attr: {
					class: 'user',
					'data-uid': user.uid,
				},
				childs: [
					{
						tag: 'div',
						attr: {
							class: 'avt',
						},
						childs: [
							{
								tag: 'img',
								attr: {
									src: `/images/avatars/${user.avatar}(custom).webp`,
									height: 30,
									width: 30,
								},
							},
							{
								tag: 'i',
								attr: {
									class: 'fa-solid fa-circle activeStatus',
								},
							},
						],
					},
					{
						tag: 'span',
						text: user.uid == myId ? user.username + ' (You)' : user.username,
					},
				],
			}
		);

		listItem.append(userFragment);

		if (user.uid == myId){
			document.getElementById('userlist').prepend(listItem);
		}else{
			document.getElementById('userlist').appendChild(listItem);
		}
	});
});

//any server side message
chatSocket.on('server_message', (meta, type) => {
	switch (type) {
	case 'join':
		playJoinSound();
		break;
	case 'leave':
		playLeaveSound();
		break;
	case 'location':
		playLocationSound();
		break;
	}
	serverMessage(meta, type);
});
//new message received from other users
chatSocket.on('newMessage', (message, type, id, uid, reply, replyId, options) => {
	if (type == 'text'){
		playIncomingSound();
	}else if(type == 'sticker'){
		playStickerSound();
	}
	insertNewMessage(message, type, id, uid, reply, replyId, options, {});
	notifyUser({data: type == 'text' ? message : '', type: type[0].toUpperCase()+type.slice(1)}, userInfoMap.get(uid)?.username, userInfoMap.get(uid)?.avatar);
});

chatSocket.on('seen', meta => {
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
		element.src = `/images/avatars/${meta.avatar}(custom)-mini.webp`;
		element.dataset.user = meta.userId;
		message.querySelector('.seenBy').appendChild(element);
		if (message.querySelector('.seenBy').childElementCount > 1){
			message.classList.add('seenByMultiple');
		}
		checkgaps(message.id);
		updateScroll();
	}
});

chatSocket.on('getReact', (target, messageId, myId) => {
	getReact(target, messageId, myId);
});

chatSocket.on('deleteMessage', (messageId, userName) => {
	deleteMessage(messageId, userName);
});

chatSocket.on('typing', (user, id) => {
	playTypingSound();
	userTypingMap.set(id, user);
	setTypingUsers();
});
  
chatSocket.on('stoptyping', (id) => {
	userTypingMap.delete(id);
	setTypingUsers();
});

//on disconnect
chatSocket.on('disconnect', () => {
	const id = crypto.randomUUID();
	console.log('%cDisconnected from message relay server.', 'color: red;');
	serverMessage({color: 'grey', text: 'Disconnected from server😔', id: id}, 'disconnect');
	playLeaveSound();
	showPopupMessage('Disconnected from server');
});