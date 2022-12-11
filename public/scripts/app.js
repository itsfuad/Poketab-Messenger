//enable strict mode
'use strict';

//bundles
//!last added 1763 no line

import {io} from 'socket.io-client';
import Mustache from 'mustache';
import {Stickers} from './../stickers/stickersConfig';
import { PanZoom } from './panzoom';

console.log('loaded');

//variables
const socket = io();
const fileSocket = io('/file');
//main message Element where all messages are inserted
const messages = document.getElementById('messages');
//const emoji_regex = /^(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])+$/;
const maxWindowHeight = window.innerHeight;
const replyToast = document.getElementById('replyToast');
const lightboxClose = document.getElementById('lightbox__close');
const textbox = document.getElementById('textbox');
//const options = document.querySelector('.options');
const copyOption = document.querySelector('.copyOption');
const downloadOption = document.querySelector('.downloadOption');
const deleteOption = document.querySelector('.deleteOption');
const replyOption = document.querySelector('.replyOption');
const fileDropZone = document.querySelector('.fileDropZone');
const showMoreReactBtn = document.getElementById('showMoreReactBtn');


const incommingmessage = new Audio('/sounds/incommingmessage.mp3');
const outgoingmessage = new Audio('/sounds/outgoingmessage.mp3');
const joinsound = new Audio('/sounds/join.mp3');
const leavesound = new Audio('/sounds/leave.mp3');
const typingsound = new Audio('/sounds/typing.mp3');
const locationsound = new Audio('/sounds/location.mp3');
const reactsound = new Audio('/sounds/react.mp3');
const clickSound = new Audio('/sounds/click.mp3');
const stickerSound = new Audio('/sounds/sticker.mp3');

const sendButton = document.getElementById('send');
const photoButton = document.getElementById('photo');
const fileButton = document.getElementById('file');


let isTyping = false, timeout = undefined;

const myId = document.getElementById('myId').textContent;
const myName = document.getElementById('myName').textContent;
const myAvatar = document.getElementById('myAvatar').textContent;
const myKey = document.getElementById('myKey').textContent;
const maxUser = document.getElementById('maxUser').textContent;

const messageTemplate = document.getElementById('messageTemplate').innerHTML;
const fileTemplate = document.getElementById('fileTemplate').innerHTML;

document.getElementById('userMetaTemplate').remove();
document.getElementById('messageTemplate').remove();
document.getElementById('fileTemplate').remove();

let THEME = '';

const themeAccent = {
	blue: {
		secondary: 'hsl(213, 98%, 57%)',
		foreground: '#e1eeff',
		msg_get: 'hsl(213, 40%, 57%)',
		msg_get_reply: 'hsl(213, 35%, 27%)',
		msg_send: 'hsl(213, 98%, 57%)',
		msg_send_reply: 'hsl(213, 88%, 27%)'
	},
	geometry: {
		secondary: 'hsl(15, 98%, 57%)',
		foreground: '#e1eeff',
		msg_get: 'hsl(15, 40%, 57%)',
		msg_get_reply: 'hsl(15, 35%, 27%)',
		msg_send: 'hsl(15, 98%, 57%)',
		msg_send_reply: 'hsl(15, 88%, 27%)'
	},
	dark_mood: {
		secondary: 'hsl(216, 37%, 44%)',
		foreground: '#e1eeff',
		msg_get: 'hsl(216, 27%, 33%)',
		msg_get_reply: 'hsl(216, 20%, 21%)',
		msg_send: 'hsl(216, 37%, 44%)',
		msg_send_reply: 'hsl(216, 32%, 23%)'
	},
	forest: {
		secondary: 'hsl(162, 60%, 42%)',
		foreground: '#e1eeff',
		msg_get: 'hsl(162, 18%, 41%)',
		msg_get_reply: 'hsl(162, 14%, 27%)',
		msg_send: 'hsl(162, 60%, 42%)',
		msg_send_reply: 'hsl(162, 32%, 34%)'
	}
};

const themeArray = ['blue', 'geometry', 'dark_mood', 'forest'];

const reactArray = {
	primary: ['💙', '😆','😠','😢','😮','🙂','🌻'],
	last: '🌻',
	expanded: ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','😘','🥰','😗','😙','😚','🙂','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','🥱','😴','😌','😛','😜','😝','🤤','😒','😓','😔','😕','🙃','🤑','😲','🙁','😖','😞','😟','😤','😢','😭','😦','😧','😨','😩','🤯','😬','😰','😱','🥵','🥶','😳','🤪','😵','🥴','😠','😡','🤬','😷','🤒','🤕','🤢','🤮','🤧','😇','🥳','🥺','🤠','🤡','🤥','🤫','🤭','🧐','🤓','😈','👿','👹','👺','💀','☠','👻','👽','👾','🤖','💩','😺','😸','😹','😻','🙈','🙉','🙊','🐵','🐶','🐺','🐱','🦁','🐯','🦒','🦊','🦝','🐮','🐷','🐗','🐭','🐹','🐰','🐻','🐨','🐼','🐸','🦓','🐴','🦄','🐔','🐲','🐽','🐧','🐥','🐤','🐣', '🌻', '🌸', '🥀', '🌼', '🌷', '🌹', '🏵️', '🌺', '🦇','🦋','🐌','🐛','🦟','🦗','🐜','🐝','🐞','🦂','🕷','🕸','🦠','🧞‍♀️','🧞‍♂️','🗣','👀','🦴','🦷','👅','👄','🧠','🦾','🦿','👩🏻','👨🏻','🧑🏻','👧🏻','👦🏻','🧒🏻','👶🏻','👵🏻','👴🏻','🧓🏻','👩🏻‍🦰','👨🏻‍🦰','👩🏻‍🦱','👨🏻‍🦱','👩🏻‍🦲','👨🏻‍🦲','👩🏻‍🦳','👨🏻‍🦳','👱🏻‍♀️','👱🏻‍♂️','👸🏻','🤴🏻','👳🏻‍♀️','👳🏻‍♂️','👲🏻','🧔🏻','👼🏻','🤶🏻','🎅🏻','👮🏻‍♀️','👮🏻‍♂️','🕵🏻‍♀️','🕵🏻‍♂️','💂🏻‍♀️','💂🏻‍♂️','👷🏻‍♀️','👷🏻‍♂️','👩🏻‍⚕️','👨🏻‍⚕️','👩🏻‍🎓','👨🏻‍🎓','👩🏻‍🏫','👨🏻‍🏫','👩🏻‍⚖️','👨🏻‍⚖️','👩🏻‍🌾','👨🏻‍🌾','👩🏻‍🍳','👨🏻‍🍳','👩🏻‍🔧','👨🏻‍🔧','👩🏻‍🏭','👨🏻‍🏭','👩🏻‍💼','👨🏻‍💼','👩🏻‍🔬','👨🏻‍🔬','👩🏻‍💻','👨🏻‍💻','👩🏻‍🎤','👨🏻‍🎤','👩🏻‍🎨','👨🏻‍🎨','👩🏻‍✈️','👨🏻‍✈️','👩🏻‍🚀','👨🏻‍🚀','👩🏻‍🚒','👨🏻‍🚒','🧕🏻','👰🏻','🤵🏻','🤱🏻','🤰🏻','🦸🏻‍♀️','🦸🏻‍♂️','🦹🏻‍♀️','🦹🏻‍♂️','🧙🏻‍♀️','🧙🏻‍♂️','🧚🏻‍♀️','🧚🏻‍♂️','🧛🏻‍♀️','🧛🏻‍♂️','🧜🏻‍♀️','🧜🏻‍♂️','🧝🏻‍♀️','🧝🏻‍♂️','🧟🏻‍♀️','🧟🏻‍♂️','🙍🏻‍♀️','🙍🏻‍♂️','🙎🏻‍♀️','🙎🏻‍♂️','🙅🏻‍♀️','🙅🏻‍♂️','🙆🏻‍♀️','🙆🏻‍♂️','🧏🏻‍♀️','🧏🏻‍♂️','💁🏻‍♀️','💁🏻‍♂️','🙋🏻‍♀️','🙋🏻‍♂️','🙇🏻‍♀️','🙇🏻‍♂️','🤦🏻‍♀️','🤦🏻‍♂️','🤷🏻‍♀️','🤷🏻‍♂️','💆🏻‍♀️','💆🏻‍♂️','💇🏻‍♀️','💇🏻‍♂️','🧖🏻‍♀️','🧖🏻‍♂️','🤹🏻‍♀️','🤹🏻‍♂️','👩🏻‍🦽','👨🏻‍🦽','👩🏻‍🦼','👨🏻‍🦼','👩🏻‍🦯','👨🏻‍🦯','🧎🏻‍♀️','🧎🏻‍♂️','🧍🏻‍♀️','🧍🏻‍♂️','🚶🏻‍♀️','🚶🏻‍♂️','🏃🏻‍♀️','🏃🏻‍♂️','💃🏻','🕺🏻','🧗🏻‍♀️','🧗🏻‍♂️','🧘🏻‍♀️','🧘🏻‍♂️','🛀🏻','🛌🏻','🕴🏻','🏇🏻','🏂🏻','💪🏻','🦵🏻','🦶🏻','👂🏻','🦻🏻','👃🏻','🤏🏻','👈🏻','👉🏻','☝🏻','👆🏻','👇🏻','✌🏻','🤞🏻','🖖🏻','🤘🏻','🤙🏻','🖐🏻','✋🏻','👌🏻','👍🏻','👎🏻','✊🏻','👊🏻','🤛🏻','🤜🏻','🤚🏻','👋🏻','🤟🏻','✍🏻','👏🏻','👐🏻','🙌🏻','🤲🏻','🙏🏻','🤝🏻','💅🏻','📌','❤️','🧡','💛','💚','💙','💜','🤎','🖤','🤍','💔','❣','💕','💞','💓','💗','💖','💘','💝','💟','💌','💢','💥','💤','💦','💨','💫'],
};

//here we add the usernames who are typing
const userTypingMap = new Map();
//all the user and their info is stored in this map
const userInfoMap = new Map();
const fileBuffer = new Map();

let softKeyIsUp = false; //to check if soft keyboard of phone is up or not
let scrolling = false; //to check if user is scrolling or not
let lastPageLength = messages.scrollTop; // after adding a new message the page size gets updated
let scroll = 0; //total scrolled up or down by pixel
const selectedImage = {
	data: '',
	name: '',
	size: '',
	ext: ''
};
const selectedFile = {
	data: '',
	name: '',
	size: '',
	ext: ''
};
let selectedObject = '';
//the message which fires the event
const targetMessage = {
	sender: '',
	message: '',
	type: '',
	id: '',
};

const targetFile = {
	fileName: '',
	fileData: ''
};

//after the message is varified we store the message info here
let finalTarget = {
	sender: '',
	message: '',
	type: '', 
	id: '',
};

let lastSeenMessage = null;
let lastNotification = undefined;

//first load functions 
//if user device is mobile
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

//This class is used to detect the long press on messages and fire the callback function
class ClickAndHold{
	constructor(target, timeOut, callback){
		this.target = target; //the target element
		this.callback = callback; //the callback function
		this.isHeld = false; //is the hold active
		this.activeHoldTimeoutId = null;  //the timeout id
		this.timeOut = timeOut; //the time out for the hold [in ms] eg: if timeOut = 1000 then the hold will be active for 1 second
		//start event listeners
		['touchstart', 'mousedown'].forEach(eventName => {
			try{
				this.target.addEventListener(eventName, this._onHoldStart.bind(this));
			}
			catch(e){
				console.log(e);
			}
		});
		//event added to detect if the user is moving the finger or mouse
		['touchmove', 'mousemove'].forEach(eventName => {
			try{
				this.target.addEventListener(eventName, this._onHoldMove.bind(this));
			}
			catch(e){
				console.log(e);
			}
		});
		// event added to detect if the user is releasing the finger or mouse
		['mouseup', 'touchend', 'mouseleave', 'mouseout', 'touchcancel'].forEach(eventName => {
			try{
				this.target.addEventListener(eventName, this._onHoldEnd.bind(this));
			}
			catch(e){
				console.log(e);
			}
		});
	}
	//this function is called when the user starts to hold the finger or mouse
	_onHoldStart(evt){
		this.isHeld = true;
		this.activeHoldTimeoutId = setTimeout(() => {
			if (this.isHeld) {
				this.callback(evt);
			}
		}, this.timeOut);
	}
	//this function is called when the user is moving the finger or mouse
	_onHoldMove(){
		this.isHeld = false;
	}
	//this function is called when the user releases the finger or mouse
	_onHoldEnd(){
		this.isHeld = false;
		clearTimeout(this.activeHoldTimeoutId);
	}
	//a static function to use the class utility without creating an instance
	static applyTo(target, timeOut, callback){
		try{
			new ClickAndHold(target, timeOut, callback);
		}
		catch(e){
			console.log(e);
		}
	}
}
//detect if user is using a mobile device, if yes then use the click and hold class
if (isMobile){
	ClickAndHold.applyTo(messages, 300, (evt)=>{
		const isDeleted = evt.target.closest('.message').dataset.deleted == 'true' ? true : false;
		if (!isDeleted){
			OptionEventHandler(evt);
		}
	});
}

//is user is not using a mobile device then we use the mouse click event
if(!isMobile){
	messages.addEventListener('contextmenu', (evt) => {
		evt.preventDefault();
		evt.stopPropagation();
		if (evt.which == 3){
			const isMessage = evt.target.closest('.message') ?? false;
			const isDeleted = evt.target.closest('.message')?.dataset.deleted == 'true' ? true : false;
			if (isMessage && !isDeleted){
				OptionEventHandler(evt);
			}
		}
	});
}


//functions

function loadReacts(){
	//load all the reacts from the react object
	const reacts = document.getElementById('reactOptions');

	for (let i = 0; i < reactArray.primary.length - 1; i++){
		const react = document.createElement('div');

		react.classList.add(`${reactArray.primary[i]}`);
		react.classList.add('react-emoji');
		react.textContent = reactArray.primary[i];
     
		reacts.insertBefore(react, reacts.lastElementChild);
	}

	let lastReact = localStorage.getItem('lastReact') || reactArray.last;

	if (!reactArray.expanded.includes(lastReact)){
		lastReact = '🌻';
	}

	reactArray.primary.includes(lastReact) ? lastReact = '🌻' : lastReact;

	const last = document.createElement('div');

	last.classList.add(`${lastReact}`);
	last.classList.add('react-emoji');
	last.classList.add('last');
	last.textContent = lastReact;

	reacts.insertBefore(last, reacts.lastElementChild);

	const moreReacts = document.querySelector('.moreReacts');

	for (let i = 0; i < reactArray.expanded.length; i++){
       
		const moreRreact = document.createElement('div');
		moreRreact.classList.add('react-emoji');
		moreRreact.classList.add(`${reactArray.expanded[i]}`);
		moreRreact.textContent = reactArray.expanded[i];
		moreReacts.appendChild(moreRreact);
	}
}

loadReacts();

function loadTheme(){
	THEME = localStorage.getItem('theme');
	if(THEME == null || themeArray.includes(THEME) == false){
		THEME = 'blue';
		localStorage.setItem('theme', THEME);
	}
	document.documentElement.style.setProperty('--pattern', `url('../images/backgrounds/${THEME}_w.webp')`);
	document.documentElement.style.setProperty('--secondary-dark', themeAccent[THEME].secondary);
	document.documentElement.style.setProperty('--msg-get', themeAccent[THEME].msg_get);
	document.documentElement.style.setProperty('--msg-get-reply', themeAccent[THEME].msg_get_reply);
	document.documentElement.style.setProperty('--msg-send', themeAccent[THEME].msg_send);
	document.documentElement.style.setProperty('--msg-send-reply', themeAccent[THEME].msg_send_reply);
	document.querySelector('meta[name="theme-color"]').setAttribute('content', themeAccent[THEME].secondary);
}

loadTheme();

//sets the app height to the max height of the window
function appHeight () {
	const doc = document.documentElement;
	doc.style.setProperty('--app-height', `${window.innerHeight}px`);
}

//this function generates a random id
function makeId(length = 10){
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++){
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

//this function inserts a message in the chat box
function insertNewMessage(message, type, id, uid, reply, replyId, options, metadata){
	//detect if the message has a reply or not
	try{
		if (!options){
			options = {
				reply: false,
				title: false
			};
		}
	
		let classList = ''; //the class list for the message. Initially empty. 
		const lastMsg = messages.querySelector('.message:last-child'); //the last message in the chat box
		let popupmsg = ''; //the message to be displayed in the popup if user scrolled up 
		const messageIsEmoji = isEmoji(message); //detect if the message is an emoji or not
		if (type === 'text'){ //if the message is a text message
			popupmsg = message.length > 20 ? `${message.substring(0, 20)} ...` : message; //if the message is more than 20 characters then display only 20 characters
			message = messageFilter(message); //filter the message
			message = `<p class='text'>${message}</p>`;
		}else if(type === 'image'){ //if the message is an image
			popupmsg = 'Image'; //the message to be displayed in the popup if user scrolled up
			message = sanitize(message); //sanitize the message
			message = `<img class='image' src='${message}' alt='image' height='${metadata.height}' width='${metadata.width}' /><div class='sendingImage'> Uploading...</div>`; //insert the image
		}else if (type === 'sticker'){
			popupmsg = 'Sticker';
			message = sanitize(message);
			message = `<img class='sticker' src='/stickers/${message}.webp' alt='sticker' height='${metadata.height}' width='${metadata.width}' />`;
		}else if(type != 'text' && type != 'image' && type != 'file' && type != 'sticker'){ //if the message is not a text or image message
			throw new Error('Invalid message type');
		}
		if(uid == myId){ //if the message is sent by the user is me
			classList += ' self'; 
		}
	
		if (lastMsg?.dataset?.uid != uid || messageIsEmoji || type === 'sticker'){ // if the last message is not from the same user
			//set the message as it is the first and last message of the user
			//first message has the top corner rounded
			//last message has the bottom corner rounded
			classList += ' start end'; 
		}else  if (lastMsg?.dataset?.uid == uid){ //if the last message is from the same user
			if (!options.reply && !lastMsg?.classList.contains('emoji') && !lastMsg?.classList.contains('sticker')){ //and the message is not a reply
				lastMsg?.classList.remove('end'); //then remove the bottom corner rounded from the last message
			}else{
				classList += ' start';
			}
			classList += ' end';
		}
		if(messageIsEmoji){ //if the message is an emoji or sticker
			lastMsg?.classList.add('end');
			classList += ' emoji';
		}
		if (type === 'sticker'){
			lastMsg?.classList.add('end');
			classList += ' sticker';
		}
		if(!options.reply){
			classList += ' noreply';
		}
		if ((!options.title || !classList.includes('start'))){
			classList += ' notitle';
		}
		else if (classList.includes('self') && classList.includes('noreply')){
			classList += ' notitle';
		}
		let username = userInfoMap.get(uid)?.name;
		const avatar = userInfoMap.get(uid)?.avatar;
		if (username == myName){username = 'You';}
	
		let html;
		let replyMsg, replyFor;
		let repliedTo;
		if (options.reply){
			//check if the replyid is available in the message list
			repliedTo = userInfoMap.get(document.getElementById(replyId || '')?.dataset?.uid)?.name;
			if (repliedTo == myName){repliedTo = 'You';}
			if (repliedTo == username){repliedTo = 'self';}
			if (!document.getElementById(replyId)){
				reply = {data: 'Message is not available on this device', type: 'text'};
			}
			if (reply.type === 'text' || reply.type === 'file'){
				replyMsg = reply.data;
				replyFor = 'message';
			}else if (reply.type === 'image'){
				replyMsg = document.getElementById(replyId)?.querySelector('.messageMain .image').outerHTML.replace('class="image"', 'class="image imageReply"');
				replyFor = 'image';
			}else if (reply.type === 'sticker'){
				replyMsg = document.getElementById(replyId)?.querySelector('.messageMain .sticker').outerHTML.replace('class="sticker"', 'class="sticker imageReply"');
				replyFor = 'image';
			}
		}
	
		if (type === 'file'){
			popupmsg = 'File';
			html = Mustache.render(fileTemplate, {
				classList: classList,
				avatarSrc: `/images/avatars/${avatar}(custom).png`,
				messageId: id,
				uid: uid,
				type: type,
				repId: replyId,
				title: options.reply? `<i class="fa-solid fa-reply"></i>${username} replied to ${repliedTo? repliedTo: 'a message'}` : username,
				data: message,
				fileName: metadata.name,
				fileSize: metadata.size,
				ext: metadata.ext,
				replyMsg: document.getElementById(replyId)?.dataset?.type === 'file' ? `<i class="fa-solid fa-paperclip"></i> ${replyMsg}` : replyMsg,
				replyFor: replyFor,
				time: getCurrentTime()
			});
		}else{
			html = Mustache.render(messageTemplate, {
				classList: classList,
				avatarSrc: `/images/avatars/${avatar}(custom).png`,
				messageId: id,
				uid: uid,
				type: type,
				repId: replyId,
				title: options.reply? `<i class="fa-solid fa-reply"></i>${username} replied to ${repliedTo? repliedTo: 'a message'}` : username,
				message: message,
				replyMsg: document.getElementById(replyId)?.dataset?.type === 'file' ? `<i class="fa-solid fa-paperclip"></i> ${replyMsg}` : replyMsg,
				replyFor: replyFor,
				time: getCurrentTime()
			});
		}
	
		lastSeenMessage = id;
	
		if (document.hasFocus()){
			socket.emit('seen', ({userId: myId, messageId: lastSeenMessage, avatar: myAvatar}));
		}
	
		const fragment = document.createDocumentFragment();
		fragment.append(document.createRange().createContextualFragment(html));
		messages.append(fragment);
		if (reply.type == 'image' || reply.type == 'sticker'){
			document.getElementById(id).querySelector('.messageReply')?.classList.add('imageReply');
		}
		lastPageLength = messages.scrollTop;
		checkgaps(lastMsg?.id);
		updateScroll(userInfoMap.get(uid)?.avatar, popupmsg);
	}catch(err){
		console.error(err);
		popupMessage(err);
	}
}

window.addEventListener('focus', () => {
	if (lastNotification != undefined){
		lastNotification.close();
	}
	socket.emit('seen', ({userId: myId, messageId: lastSeenMessage, avatar: myAvatar}));
});

function getCurrentTime(){
	//return time in hh:mm a format using Intl.DateTimeFormat
	return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(new Date());
}

function sanitize(str){
	if (str == undefined || str == '' || str == null){return '';}
	str.replaceAll('<', '&#60;');
	str.replaceAll('>', '&#62;');
	str.replaceAll('"', '&#34;');
	str.replaceAll('\'', '&#39;');
	str.replaceAll('&', '&#38;');
	return str;
}

function messageFilter(message){
	message = censorBadWords(message); //check if the message contains bad words
	//secure XSS attacks with html entity number
	message = sanitize(message);
	message = linkify(message); //if the message contains links then linkify the message
	message = message.replaceAll(/```¶/g, '```'); //replace the code block markers
	message = message.replaceAll(/```([^`]+)```/g, '<code>$1</code>'); //if the message contains code then replace it with the code tag
	message = message.replaceAll('¶', '<br>'); //if the message contains new lines then replace them with <br>
	return message;
}

function emojiParser(text){
	const emojiMap = new Map();
	emojiMap.set(':)', '🙂');
	emojiMap.set(':\'(', '😢');
	emojiMap.set(':D', '😀');
	emojiMap.set(':P', '😛');
	emojiMap.set(':p', '😛');
	emojiMap.set(':O', '😮');
	emojiMap.set(':o', '😮');
	emojiMap.set(':|', '😐');
	emojiMap.set(':/', '😕');
	emojiMap.set(':*', '😘');
	emojiMap.set('>:(', '😠');
	emojiMap.set(':(', '😞');
	emojiMap.set('o3o', '😗');
	emojiMap.set('^3^', '😙');
	emojiMap.set('^_^', '😊');
	emojiMap.set('<3', '❤️');
	emojiMap.set('>_<', '😣');
	emojiMap.set('>_>', '😒');
	emojiMap.set('-_-', '😑');
	emojiMap.set('XD', '😆');
	emojiMap.set('xD', '😆');
	emojiMap.set('B)', '😎');
	emojiMap.set(';)', '😉');
	emojiMap.set('T-T', '😭');
	emojiMap.set(':aww:', '🥺');
	emojiMap.set(':lol:', '😂');
	emojiMap.set(':haha:', '🤣');
	emojiMap.set(':hehe:', '😅');
	emojiMap.set(':meh:', '😶');
	emojiMap.set(':hmm:', '😏');
	emojiMap.set(':wtf:', '🤨');
	emojiMap.set(':yay:', '🥳');
	emojiMap.set(':yolo:', '🤪');
	emojiMap.set(':yikes:', '😱');
	emojiMap.set(':sweat:', '😅');

	//find if the message contains the emoji
	for (const [key, value] of emojiMap){
		if (text.indexOf(key) != -1){
			const position = text.indexOf(key);
			//all charecter regex
			const regex = /[a-zA-Z0-9_!@#$%^&*()+\-=[\]{};':"\\|,.<>/?]/;
			//if there is any kind of charecters before or after the match then don't replace it. 
			if (text.charAt(position - 1).match(regex) || text.charAt(position + key.length).match(regex)){
				continue;
			}else{
				text = text.replaceAll(key, value);
			}
		}
	}
	return text;
}

//returns true if the message contains only emoji
function isEmoji(text) {
	//replace white space with empty string
	if(/^([\uD800-\uDBFF][\uDC00-\uDFFF])+$/.test(text)){
		text = text.replace(/\s/g, '');
		return true;
	}   
}

function showOptions(type, sender, target){
	//removes all showing options first if any
	document.querySelector('.reactorContainerWrapper').classList.remove('active');
	document.querySelectorAll('#reactOptions div').forEach(
		option => option.style.background = 'none'
	);
	document.querySelectorAll('.moreReacts div').forEach(
		option => option.style.background = 'none'
	);
	document.getElementById('showMoreReactBtn').style.background = 'none';
	if (target.classList.contains('imageReply')){
		return;
	}
	//if the message is a text message
	if (type === 'text'){
		copyOption.style.display = 'flex';
	}else if (type === 'image' || type === 'file'){ //if the message is an image
		if (target.closest('.message')?.dataset.downloaded == 'true'){
			downloadOption.style.display = 'flex';
		}
	}
	if (sender === true){ //if the message is sent by me
		deleteOption.style.display = 'flex'; //then shgell the delete option
	}else{ //else dont show the delete option
		deleteOption.style.display = 'none';
	}
	//get if the message has my reaction or not
	const clicked = Array.from(target?.closest('.message')?.querySelectorAll('.reactedUsers .list')).reduce((acc, curr) => {
		return acc || curr.dataset.uid == myId;
	}, false);
	if (clicked){ //if the message has my reaction
		//get how many reactions the message has
		const clickedElement = target?.closest('.message')?.querySelector(`.reactedUsers [data-uid="${myId}"]`)?.textContent;
		//console.log(clickedElement);
		if (reactArray.primary.includes(clickedElement)){ //if the message has my primary reaction
			//selected react color
			document.querySelector(`#reactOptions .${clickedElement}`).style.background = themeAccent[THEME].secondary;
		}
		if (reactArray.expanded.includes(clickedElement)){
			document.querySelector(`.moreReacts .${clickedElement}`).style.background = themeAccent[THEME].secondary;
		}
		if (reactArray.expanded.includes(clickedElement) && !reactArray.primary.includes(clickedElement)){
			//2nd last element
			const elm = document.querySelector('#reactOptions');
			const lastElm = elm.lastElementChild.previousElementSibling;
			lastElm.style.background = themeAccent[THEME].secondary;
			lastElm.classList.replace(lastElm.classList[0], clickedElement);
			lastElm.textContent = clickedElement;
			reactArray.last = clickedElement;
		}
	}
	//show the options
	const options = document.getElementById('optionsContainerWrapper');
	options.style.display = 'grid';
	setTimeout(() => {
		options.classList.add('active');
		//document.getElementById('focus_glass').classList.add('active');
		addFocusGlass(false);
		options.addEventListener('click', optionsMainEvent);
	}, 20);
}

function addFocusGlass(backdrop = true){
	const focusGlass = document.getElementById('focus_glass');
	focusGlass.classList.remove('backdrop');
	focusGlass.classList.add('active');
	if (backdrop == true){
		focusGlass.classList.add('backdrop');
	}
}

function removeFocusGlass(){
	const focusGlass = document.getElementById('focus_glass');
	focusGlass.classList.remove('active');
	focusGlass.classList.remove('backdrop');
}

function optionsMainEvent(e){
	const target = e.target;
	//console.log(target);
	if (target.classList.contains('close_area') || target.id == 'optionsContainer'){
		hideOptions();
	}
	optionsReactEvent(e);
}

function deleteMessage(messageId, user){
	const message = document.getElementById(messageId);
	if (message){ //if the message exists

		if (message.dataset.type == 'image'){
			//delete the image from the source
			URL.revokeObjectURL(message.querySelector('.image').src);
			console.log(message.querySelector('.image').src, 'deleted');
		}else if (message.dataset.type == 'file'){
			//delete the file from the source
			URL.revokeObjectURL(message.querySelector('a').href);
			console.log(message.querySelector('a').href, 'deleted');
		}

		//delete all content inside message .messageMain
		while (message.querySelector('.messageMain').firstChild){
			message.querySelector('.messageMain').removeChild(message.querySelector('.messageMain').firstChild);
		}

		//if message is image or file
		message.querySelectorAll('[data-type="image"], [data-type="file"]')
			.forEach((elem) => {
				//delete element and also from the source
				URL.revokeObjectURL(elem.src);
				console.log(elem.src, 'deleted');
				elem.remove();
			});

		const fragment = document.createDocumentFragment();
		const p = document.createElement('p');
		p.textContent = 'Deleted message';
		fragment.append(p);
		message.querySelector('.messageMain').append(fragment);
		message.classList.add('deleted');
		message.dataset.deleted = true;
		message.querySelector('.messageTitle').textContent = user;
		popupMessage(`${user == myName ? 'You': user} deleted a message`);
        
		if (maxUser == 2 || (message.dataset.uid == myId)) {
			message.querySelector('.messageTitle').style.visibility = 'hidden';
		}
		if (message.querySelector('.messageReply') != null) {
			message.querySelector('.messageReply').remove();
			message.querySelector('.reactsOfMessage').remove();
			message.querySelector('.reactedUsers').remove();
			message.classList.remove('reply');
			message.classList.remove('react');
			message.querySelector('.seenBy').style.marginTop = '0px';
			checkgaps(messageId);
		}
		const replyMsg = document.querySelectorAll(`[data-repid='${messageId}']`);
		if (replyMsg != null) {
			replyMsg.forEach(element => {
				element.classList.remove('imageReply');
				element.style.background = '#000000c4';
				element.style.color = '#7d858c';
				element.textContent = 'Deleted message';
			});
		}
		lastPageLength = messages.scrollTop;
	}
}

function downloadHandler(){
	if (document.getElementById(targetMessage.id).dataset.downloaded != 'true'){
		//if sender is me
		if (targetMessage.sender == 'You'){
			popupMessage('Not uploaded yet');
		}else{
			popupMessage('Not downloaded yet');
		}
		return;
	}
	if (targetMessage.type === 'image'){
		document.querySelector('#lightbox__image img').src = targetMessage.message.src;
		saveImage();
	}else{
		downloadFile();
	}
}

function saveImage(){
	try{
		console.log('Saving image');
		const a = document.createElement('a');
		a.href = document.querySelector('#lightbox__image img').src;
		a.download = `poketab-${Date.now()}`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}catch(e){
		console.log(e);
	}
}

function downloadFile(){
	const data = targetFile.fileData;
	const fileName = targetFile.fileName;
	//let filetype = filename.split('.').pop();
	const a = document.createElement('a');
	a.href = data;
	a.download = fileName;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}

function optionsReactEvent(e){
	const target = e.target?.classList[0];
	if (target){
		sendReact(target);
	}
}

function sendReact(react){
	if (reactArray.primary.includes(react) || reactArray.expanded.includes(react)){
		const messageId = targetMessage.id;
		localStorage.setItem('lastReact', react);
		socket.emit('react', react, messageId, myId);
		hideOptions();
	}
}

function hideOptions(){
	const options = document.getElementById('optionsContainerWrapper');
	const container = document.querySelector('.reactOptionsWrapper');
	container.dataset.closed = 'false';
	updateReactsChooser();
	options.classList.remove('active');
	document.getElementById('sidebar_wrapper').classList.remove('active');
	document.querySelector('.themeChooser').classList.remove('active');
	setTimeout(() => {
		copyOption.style.display = 'none';
		downloadOption.style.display = 'none';
		deleteOption.style.display = 'none';
		options.style.display = 'none';
	}, 20);
	//document.getElementById('focus_glass').classList.remove('active');
	removeFocusGlass();
	document.querySelector('.reactorContainerWrapper').classList.remove('active');
	options.removeEventListener('click', optionsMainEvent);
}


let xStart = null;
let yStart = null;
let xDiff = 0;
let yDiff = 0;

// Listen for a swipe on left
messages.addEventListener('touchstart', (evt) => {
	if (evt.target.closest('.message')){
		xStart = (evt.touches[0].clientX/3);
		yStart = (evt.touches[0].clientY/3);
		//console.log('Swipe started');
	}
});

messages.addEventListener('touchmove', (evt) => {
	try{
		const msg = evt.target.closest('.message');
		
		if (evt.target.classList.contains('messageMain') || evt.target.closest('.messageMain') && msg.dataset.deleted != 'true'){            
			//console.log(xDiff);
			xDiff = xStart - (evt.touches[0].clientX/3);
			yDiff = yStart - (evt.touches[0].clientY/3);
			/*
			//the angle of the swipe
			const deg = (Math.atan2(yDiff, xDiff) * 180 / Math.PI);
			console.log(deg);
			*/

			if (Math.abs(xDiff) < Math.abs(yDiff)){
				return;
			}

			const elem = msg.querySelector('.messageContainer');
			const replyIcon = msg.querySelector('.replyIcon');
			//if msg is self
			if (msg.classList.contains('self') && msg.classList.contains('delevered') /*&& deg <= 20 && deg >= -20*/) {
				if (xDiff >= 40){
					//xDiff = 50;
					elem.dataset.replyTrigger = 'true';
					replyIcon.style.transform = `translateX(${xDiff}px)`;
				}else{
					elem.dataset.replyTrigger = 'false';
				}
				xDiff = xDiff < 0 ? 0 : xDiff;
				elem.style.transform = `translateX(${-xDiff}px)`;
			}else /*if(deg <= 160 && deg >= -160 && !msg.classList.contains('self'))*/{
				if (xDiff <= -40){
					//xDiff = -50;
					elem.dataset.replyTrigger = 'true';
					replyIcon.style.transform = `translateX(${xDiff}px)`;
				}else{
					elem.dataset.replyTrigger = 'false';
				}
				xDiff = xDiff > 0 ? 0 : xDiff;
				elem.style.transform = `translateX(${-xDiff}px)`;
			}
		}
    
		//console.log('Swipe moved');
	}catch(e){
		console.log(e);
		popupMessage(e);
	}
});

// Listen for a swipe on right
messages.addEventListener('touchend', (evt) => {
	try{
		if (evt.target.closest('.message')){
			//console.log('Swipe ended');
			xDiff = 0;
			yDiff = 0; //fixed
			const msg = evt.target.closest('.message');
			if (!msg){
				return;
			}else{
				const elem = msg.querySelector('.messageContainer');
				const replyIcon = msg.querySelector('.replyIcon');
				if (elem.closest('.message').classList.contains('self')){
					replyIcon.style.transform = 'translateX(40px)';
				}else{
					replyIcon.style.transform = 'translateX(-40px)';
				}
				elem.style.transform = 'translateX(0px)';
				if (elem.dataset.replyTrigger === 'true') {
					elem.dataset.replyTrigger = 'false';
					//console.log('Reply triggered');
					//add data to finalTarget
					OptionEventHandler(evt, false);
					showReplyToast();
				}
			}
		}
	}catch(e){
		console.log(e);
		popupMessage(e);
	}
});


function showReplyToast(){
	hideOptions();
	updateScroll();
	textbox.focus();
	document.querySelector('.newmessagepopup').classList.add('toastActive');
	finalTarget = Object.assign({}, targetMessage);
	//console.dir(finalTarget);
	if (finalTarget.type == 'image' || finalTarget.type == 'sticker'){
		replyToast.querySelector('.replyData').appendChild(finalTarget.message);
	}else if (finalTarget.type == 'file'){
		replyToast.querySelector('.replyData').innerHTML = `<i class="fa-solid fa-paperclip"></i>${finalTarget.message?.substring(0, 50)}`;
	}else{
		replyToast.querySelector('.replyData').textContent = finalTarget.message?.substring(0, 50);
	}
	replyToast.querySelector('.username').textContent = finalTarget.sender;
	replyToast.style.display = 'flex';
	setTimeout(() => {
		replyToast.classList.add('active');
	}, 10);
}

function hideReplyToast(){
	replyToast.classList.remove('active');
	replyToast.style.display = 'none';
	replyToast.querySelector('.replyData').textContent = '';
	replyToast.querySelector('.username').textContent = '';
	lastPageLength = messages.scrollTop;
	document.querySelector('.newmessagepopup').classList.remove('toastActive');
	clearTargetMessage();
}

function arrayToMap(array) {
	const map = new Map();
	array.forEach(element => {
		map.set(element.textContent, map.get(element.textContent) + 1 || 1);
	});
	return map;
}

function getReact(type, messageId, uid){
	try{
		const target = document.getElementById(messageId).querySelector('.reactedUsers');
		const exists = target?.querySelector('.list') ?? false;
		if (exists){
			const list = target.querySelector('.list[data-uid="'+uid+'"]');
			if (list){
				if (list.textContent == type){
					list.remove();
				}else{
					list.textContent = type;
				}
			}else{
				reactsound.play();
				//target.innerHTML += `<div class='list' data-uid='${uid}'>${type}</div>`;
				const fragment = document.createDocumentFragment();
				const div = document.createElement('div');
				div.classList.add('list');
				div.dataset.uid = uid;
				div.textContent = type;
				fragment.append(div);
				target.append(fragment);
			}
    
		}
		else{
			//target.innerHTML += `<div class='list' data-uid='${uid}'>${type}</div>`;
			const fragment = document.createDocumentFragment();
			const div = document.createElement('div');
			div.classList.add('list');
			div.dataset.uid = uid;
			div.textContent = type;
			fragment.append(div);
			target.append(fragment);
			reactsound.play();
		}
    
		let map = new Map();
		const list = Array.from(target.querySelectorAll('.list'));
		map = arrayToMap(list);
    
		const reactsOfMessage = document.getElementById(messageId).querySelector('.reactsOfMessage');
		if (reactsOfMessage && map.size > 0){
			//reactsOfMessage.innerHTML = '';
			//delete reactsOfMessage all child nodes
			while (reactsOfMessage.firstChild) {
				reactsOfMessage.removeChild(reactsOfMessage.firstChild);
			}
			let count = 0;
			map.forEach((value, key) => {
				if (count >= 2){
					reactsOfMessage.querySelector('span').remove();
				}
				//reactsOfMessage.innerHTML += `<span>${key}${value}</span>`;
				const fragment = document.createDocumentFragment();
				const span = document.createElement('span');
				span.textContent = `${key}${value}`;
				fragment.append(span);
				reactsOfMessage.append(fragment);
				count++;
			});
			document.getElementById(messageId).classList.add('react');
			checkgaps(messageId);
		}else{
			document.getElementById(messageId).classList.remove('react');
			document.getElementById(messageId).querySelector('.seenBy').style.marginTop = '0px';
			checkgaps(messageId);
		}
		updateScroll();
	}catch(e){
		console.log('Message not exists');
	}
}


function checkgaps(targetId){
	try{
		if (targetId){
			const target = document.getElementById(targetId);
			const after = target?.nextElementSibling;
    
			if (target.classList.contains('react')){
				if (target.querySelector('.seenBy').hasChildNodes()){
					target.style.marginBottom = '0px';
					target.querySelectorAll('.seenBy img').forEach(elem => elem.style.marginTop = '12px');
				}else{
					target.style.marginBottom = '12px';
				}
			}else{
				target.style.marginBottom = '0px';
				target.querySelector('.seenBy').hasChildNodes() ? target.querySelectorAll('.seenBy img').forEach(elem => elem.style.marginTop = '0px') : null;
			}
    
			if (target != null && after != null && target?.dataset.uid === after?.dataset.uid){
				if (target.dataset.uid == myId){
					if ((Math.abs(target.querySelector('.messageContainer').getBoundingClientRect().bottom - after.querySelector('.messageContainer').getBoundingClientRect().top) > 2)){
						target.querySelector('.messageMain > *').style.borderBottomRightRadius = '15px';
						after.querySelector('.messageMain > *').style.borderTopRightRadius = '15px';
					}else{
						if (!target.classList.contains('end') && !after.classList.contains('start')){
							target.querySelector('.messageMain > *').style.borderBottomRightRadius = '3px';
							after.querySelector('.messageMain > *').style.borderTopRightRadius = '3px';
						}
					}
				}else{
					if ((Math.abs(target.querySelector('.messageContainer').getBoundingClientRect().bottom - after.querySelector('.messageContainer').getBoundingClientRect().top) > 2)){
						target.querySelector('.messageMain > *').style.borderBottomLeftRadius = '15px';
						after.querySelector('.messageMain > *').style.borderTopLeftRadius = '15px';
					}else{
						if (!target.classList.contains('end') && !after.classList.contains('start')){
							target.querySelector('.messageMain > *').style.borderBottomLeftRadius = '3px';
							after.querySelector('.messageMain > *').style.borderTopLeftRadius = '3px';
						}
					}
				}
			}
		}
	}catch(e){console.log(e);}
}

// util functions


function clearTargetMessage(){
	targetMessage.sender = '';
	targetMessage.message = '';
	targetMessage.type = '';
	targetMessage.id = '';
}

function clearFinalTarget(){
	finalTarget.sender = '';
	finalTarget.message = '';
	finalTarget.type = '';
	finalTarget.id = '';
}

function OptionEventHandler(evt, popup = true){
	let type;
	const sender = evt.target.closest('.message').classList.contains('self')? true : false;
	if (evt.target.closest('.messageMain')?.querySelector('.text') ?? null){
		type = 'text';
		//targetMessage.sender = userList.find(user => user.uid == evt.target.closest('.message')?.dataset?.uid).name;
		targetMessage.sender = userInfoMap.get(evt.target.closest('.message')?.dataset?.uid).name;
		if (targetMessage.sender == myName){
			targetMessage.sender = 'You';
		}
		targetMessage.message = evt.target.closest('.messageMain').querySelector('.text').innerText;
		targetMessage.type = type;
		targetMessage.id = evt.target?.closest('.message')?.id;
	}
	else if (evt.target.classList.contains('image') && !evt.target.classList.contains('imageReply')){
		type = 'image';
		//document.querySelector('#lightbox__image').innerHTML = "";
		while (document.querySelector('#lightbox__image').firstChild) {
			document.querySelector('#lightbox__image').removeChild(document.querySelector('#lightbox__image').firstChild);
		}
		//document.querySelector('#lightbox__image').innerHTML = `<img src="${evt.target.closest('.message').querySelector('.image').src}" alt="Image">`;
		const fragment = document.createDocumentFragment();
		const img = document.createElement('img');
		img.src = evt.target.closest('.messageMain')?.querySelector('.image').src;
		img.alt = 'Image';
		fragment.append(img);
		document.querySelector('#lightbox__image').append(fragment);
		//targetMessage.sender = userList.find(user => user.uid == evt.target.closest('.message')?.dataset?.uid).name;
		targetMessage.sender = userInfoMap.get(evt.target.closest('.message')?.dataset?.uid).name;
		if (targetMessage.sender == myName){
			targetMessage.sender = 'You';
		}
        
		const targetNode = evt.target.closest('.messageMain').querySelector('.image').cloneNode(true);
		targetMessage.message = targetNode;
		targetMessage.type = type;
		targetMessage.id = evt.target?.closest('.message')?.id;
	}
	else if (evt.target.closest('.messageMain')?.querySelector('.file') ?? null){
		type = 'file';
		targetMessage.sender = userInfoMap.get(evt.target.closest('.message')?.dataset?.uid).name;
		if (targetMessage.sender == myName){
			targetMessage.sender = 'You';
		}
		targetFile.fileName = evt.target.closest('.messageMain').querySelector('.fileName').textContent;
		targetFile.fileData = evt.target.closest('.messageMain').querySelector('.file').dataset.data;
		targetMessage.message = targetFile.fileName;
		targetMessage.type = type;
		targetMessage.id = evt.target?.closest('.message')?.id;
	}else if (evt.target.closest('.messageMain')?.querySelector('.sticker') ?? null){
		type = 'sticker';
		targetMessage.sender = userInfoMap.get(evt.target.closest('.message')?.dataset?.uid).name;
		if (targetMessage.sender == myName){
			targetMessage.sender = 'You';
		}
		const targetNode = evt.target.closest('.messageMain').querySelector('.sticker').cloneNode(true);
		targetMessage.message = targetNode;
		targetMessage.type = type;
		targetMessage.id = evt.target?.closest('.message')?.id;
	}
	if ((type === 'text' || type === 'image' || type === 'file' || type === 'sticker') && popup){
		showOptions(type, sender, evt.target);
	}
	vibrate();
}


function updateScroll(avatar = null, text = ''){
	if (scrolling) {
		if (text.length > 0 && avatar != null) {   
			document.querySelector('.newmessagepopup img').style.display = 'block';
			document.querySelector('.newmessagepopup .msg').style.display = 'block';
			document.querySelector('.newmessagepopup .downarrow').style.display = 'none';
			document.querySelector('.newmessagepopup img').src = `/images/avatars/${avatar}(custom).png`;
			document.querySelector('.newmessagepopup .msg').textContent = text;
			document.querySelector('.newmessagepopup').classList.add('active');
		}
		return;
	}
	setTimeout(() => {
		const messages = document.getElementById('messages');
		messages.scrollTo(0, messages.scrollHeight);
		lastPageLength = messages.scrollTop;
	}, 20);
}


function removeNewMessagePopup() {
	document.querySelector('.newmessagepopup').classList.remove('active');
	//document.querySelector('.newmessagepopup .msg')?.removeChild(document.querySelector('.newmessagepopup .msg').firstChild);
	document.querySelector('.newmessagepopup img').style.display = 'none';
	document.querySelector('.newmessagepopup .downarrow').style.display = 'none';
}


function censorBadWords(text) {
	text = text.replace(/fuck/g, 'f**k');
	text = text.replace(/shit/g, 's**t');
	text = text.replace(/bitch/g, 'b**t');
	text = text.replace(/asshole/g, 'a**hole');
	text = text.replace(/dick/g, 'd**k');
	text = text.replace(/pussy/g, 'p**s');
	text = text.replace(/cock/g, 'c**k');
	text = text.replace(/baal/g, 'b**l');
	text = text.replace(/sex/g, 's*x');
	text = text.replace(/Fuck/g, 'F**k');
	text = text.replace(/Shit/g, 'S**t');
	text = text.replace(/Bitch/g, 'B**t');
	text = text.replace(/Asshole/g, 'A**hole');
	text = text.replace(/Dick/g, 'D**k');
	text = text.replace(/Pussy/g, 'P**s');
	text = text.replace(/Cock/g, 'C**k');
	text = text.replace(/Baal/g, 'B**l');
	text = text.replace(/Sex/g, 'S*x');
	return text;
}


function getTypingString(userTypingMap){
	if (userTypingMap.size > 0){
		const array = Array.from(userTypingMap.values());
		let string = '';
      
		if (array.length >= 1){
			if (array.length == 1){
				string = array[0];
			}
			else if (array.length == 2){
				string = `${array[0]} and ${array[1]}`;
			}
			else if (array.length ==  3){
				string = `${array[0]}, ${array[1]} and ${array[2]}`;
			}
			else{
				string = `${array[0]}, ${array[1]}, ${array[2]} and ${array.length - 3} other${array.length - 3 > 1 ? 's' : ''}`;
			}
		}
		string += `${array.length > 1 ? ' are ': ' is '} typing...`;
		return string;
	}else{
		return '';
	}
}


function typingStatus(){
	if (timeout) {
		clearTimeout(timeout);
		timeout = undefined;
	}
	if (!isTyping) {
		isTyping = true;
		socket.emit('typing');
	}
	timeout = setTimeout(function () {
		isTyping = false;
		socket.emit('stoptyping');
	}, 1000);
}

function resizeTextbox(){
	textbox.style.height = 'auto';
	textbox.style.height = textbox.scrollHeight + 'px';
}


function resizeImage(img, mimetype, q = 1080) {
	const canvas = document.createElement('canvas');
	let width = img.width;
	let height = img.height;
	const max_height = q;
	const max_width = q;
	// calculate the width and height, constraining the proportions
	if (width > height) {
		if (width > max_width) {
			//height *= max_width / width;
			height = Math.round(height *= max_width / width);
			width = max_width;
		}
	} else {
		if (height > max_height) {
			//width *= max_height / height;
			width = Math.round(width *= max_height / height);
			height = max_height;
		}
	}
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0, width, height);
	return {data: canvas.toDataURL(mimetype, 1), height: height, width: width}; 
}
  
function linkify(inputText) {
	//URLs starting with http://, https://, www.

	//if input text contains a link, then make it clickable
	if (inputText.includes('http://') || inputText.includes('https://') || inputText.includes('www.')){
		//wrap the link in an anchor tag and return the text
		//find for https:// or http:// or www.
		const regex = /(https?:\/\/|www\.)[^\s]+/g;
		return inputText.replace(regex, function(url) {
			url = sanitize(url);
			//if the url does not contain http:// or https://, then add http://
			if (!/^(?:f|ht)tps?:\/\//.test(url)) {
				url = 'http://' + url;
			}
			return '<a href="' + url + '">' + url + '</a>';
		});
	}else{
		return inputText;
	}
}

function copyText(text){
	if (text == null){
		text = targetMessage.message;
	}
	if (!navigator.clipboard){
		popupMessage('This browser does\'t support clipboard access');
		return;
	}
	navigator.clipboard.writeText(text);
	popupMessage('Copied to clipboard');
}

let popupTimeout = undefined;

function popupMessage(text){
	//$('.popup-message').text(text);
	document.querySelector('.popup-message').textContent = text;
	//$('.popup-message').fadeIn(500);
	document.querySelector('.popup-message').classList.add('active');
	if (popupTimeout){
		clearTimeout(popupTimeout);
	}
	popupTimeout = setTimeout(function () {
		//$('.popup-message').fadeOut(500);
		document.querySelector('.popup-message').classList.remove('active');
		popupTimeout = undefined;
	}, 1000);
}

function serverMessage(message, type) {
	const serverMessageElement = document.createElement('li');
	serverMessageElement.classList.add('serverMessage', 'msg-item');
	serverMessageElement.id = message.id;
	const seenBy = document.createElement('div');
	seenBy.classList.add('seenBy');
	const messageContainer = document.createElement('div');
	messageContainer.classList.add('messageContainer');
	messageContainer.style.color = message.color;
	if (type == 'location'){
		//<a href='https://www.google.com/maps?q=${coord.latitude},${coord.longitude}' target='_blank'><i class="fa-solid fa-location-dot fa-flip" style="padding: 15px 5px; --fa-animation-duration: 2s; font-size: 2rem;"></i>${user.name}'s location</a>
		const locationLink = document.createElement('a');
		locationLink.href = `https://www.google.com/maps?q=${message.coordinate.latitude},${message.coordinate.longitude}`;
		locationLink.target = '_blank';
		locationLink.textContent = `${message.user}'s location`;
		const locationIcon = document.createElement('i');
		locationIcon.classList.add('fa-solid', 'fa-location-dot', 'fa-flip');
		locationIcon.style.padding = '15px 5px';
		locationIcon.style['--fa-animation-duration'] = '2s';
		locationIcon.style.fontSize = '2rem';
		locationLink.prepend(locationIcon);
		messageContainer.append(locationLink);
		serverMessageElement.append(messageContainer, seenBy);
		messages.appendChild(serverMessageElement);
		updateScroll('location', `${message.user}'s location`);
	}else if(type == 'leave'){
		messageContainer.textContent = message.text;
		serverMessageElement.append(messageContainer, seenBy);
		messages.appendChild(serverMessageElement);
		userTypingMap.delete(message.who);
		document.querySelectorAll(`.msg-item[data-seen*="${message.who}"]`)
			.forEach(elem => {
				elem.querySelector(`.seenBy img[data-user="${message.who}"]`)?.remove();
				//checkgaps(elem.id);
			});
		document.getElementById('typingIndicator').textContent = getTypingString(userTypingMap);
		updateScroll();
	}else{
		messageContainer.textContent = message.text;
		serverMessageElement.append(messageContainer, seenBy);
		messages.appendChild(serverMessageElement);
		updateScroll();
	}
	lastSeenMessage = message.id;
	if (document.hasFocus()){
		socket.emit('seen', ({userId: myId, messageId: lastSeenMessage, avatar: myAvatar}));
	}
}

function vibrate(){
	if (navigator.vibrate) {
		navigator.vibrate(50);
	}
}

let selectedStickerGroup, selectedStickerGroupCount;

selectedStickerGroup = localStorage.getItem('selectedStickerGroup') || Stickers[0].name;

const stickersGrp = document.getElementById('selectStickerGroup');

const loadedStickerHeader = false;

function loadStickerHeader(){
	if (loadedStickerHeader){
		return;
	}
	stickersGrp.innerHTML = '';
	for (const sticker of Stickers){
		const img = document.createElement('img');
		img.src = `/stickers/${sticker.name}/animated/${sticker.icon}.webp`;
		img.alt = sticker.name;
		img.dataset.name = sticker.name;
		img.classList.add('stickerName', 'clickable');
		stickersGrp.append(img);
	}
}


function loadStickers(){
	//if selectedStickerGroup is not contained in Stickers, then set it to the first sticker group
	if (!Stickers.some(sticker => sticker.name == selectedStickerGroup)){
		selectedStickerGroup = Stickers[0].name;
		localStorage.setItem('selectedStickerGroup', selectedStickerGroup);
	}

	selectedStickerGroupCount = Stickers.find(sticker => sticker.name == selectedStickerGroup).count;
	const stickersContainer = document.getElementById('stickers');
	stickersContainer.innerHTML = '';
	for (let i = 1; i <= selectedStickerGroupCount; i++) {
		const img = document.createElement('img');
		img.src = `/stickers/${selectedStickerGroup}/static/${i}-mini.webp`;
		img.alt = `${selectedStickerGroup}-${i}`;
		img.dataset.name = `${selectedStickerGroup}/animated/${i}`;
		img.classList.add('stickerpack', 'clickable');
		stickersContainer.append(img);
	}
    
	const selectedSticker = document.querySelector('.names > img[data-name="' + selectedStickerGroup + '"]');
	selectedSticker.dataset.selected = 'true';
	//document.querySelector('.names > img[data-name="' + selectedStickerGroup + '"]').style.background = themeAccent[THEME].msg_send;
}

function showStickersPanel(){
	//updateScroll();
	document.getElementById('stickersPanel').style.display = 'flex';
	setTimeout(() => {
		addFocusGlass(false);
		document.getElementById('stickersPanel').classList.add('active');
		const grp = document.getElementById('selectStickerGroup');
		grp.querySelector(`img[data-name="${selectedStickerGroup}"]`).scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'});
	}, 100);
}

document.getElementById('focus_glass').addEventListener('click', () => {
	//document.getElementById('focus_glass').classList.remove('active');
	removeFocusGlass();
	closeStickersPanel();
});

document.querySelector('.fa-angle-left').addEventListener('click', () => {
	//scroll to left by 60px
	stickersGrp.scrollTo({
		left: stickersGrp.scrollLeft - 60,
		behavior: 'smooth'
	});
});

document.querySelector('.fa-angle-right').addEventListener('click', () => {
	//scroll to right by 60px
	stickersGrp.scrollTo({
		left: stickersGrp.scrollLeft + 60,
		behavior: 'smooth'
	});
});

function closeStickersPanel(){
	//document.getElementById('focus_glass').classList.remove('active');
	removeFocusGlass();
	document.getElementById('stickersPanel').classList.remove('active');
	setTimeout(() => {
		document.getElementById('stickersPanel').style.display = 'none';
	}, 10);
}


//Event listeners
document.querySelector('.stickerBtn').addEventListener('click', () => {
	showStickersPanel();
});

document.getElementById('selectStickerGroup').addEventListener('click', e => {
	if (e.target.tagName === 'IMG') {
		document.getElementById('stickers').innerHTML = 'Loading&nbsp;<i class="fa-solid fa-circle-notch fa-spin" style="color: var(--secondary-dark)"></i>';
		document.getElementById('selectStickerGroup').querySelectorAll('.stickerName')
			.forEach(sticker => {
				sticker.dataset.selected = 'false';
			});
		selectedStickerGroup = e.target.dataset.name;
		//save to local storage
		localStorage.setItem('selectedStickerGroup', selectedStickerGroup);
		selectedStickerGroupCount = Stickers.find(sticker => sticker.name === selectedStickerGroup).count;
		loadStickers();
	}
});

document.getElementById('stickers').addEventListener('click', e => {
	if (e.target.tagName === 'IMG') {
		/*
        document.getElementById('stickers').querySelectorAll('.stickerpack')
        .forEach(sticker => {
            sticker.style.background = 'transparent';
        });
        */
		//e.target.style.background = themeAccent[THEME].msg_send;
		const tempId = makeId();
		//insertNewMessage(e.target.dataset.name, 'sticker', tempId, myId, finalTarget.message, finalTarget.id, {});
		stickerSound.play();
		scrolling = false;
		updateScroll();
		insertNewMessage(e.target.dataset.name, 'sticker', tempId, myId, {data: finalTarget?.message, type: finalTarget?.type}, finalTarget?.id, {reply: (finalTarget.message ? true : false), title: (finalTarget.message || maxUser > 2 ? true : false)}, {});
		socket.emit('message', e.target.dataset.name, 'sticker', myId, {data: finalTarget?.message, type: finalTarget?.type}, finalTarget?.id, {reply: (finalTarget.message ? true : false), title: (finalTarget.message || maxUser > 2 ? true : false)}, function(id){
			outgoingmessage.play();
			document.getElementById(tempId).classList.add('delevered');
			document.getElementById(tempId).id = id;
			lastSeenMessage = id;
			if (document.hasFocus()){
				socket.emit('seen', ({userId: myId, messageId: lastSeenMessage, avatar: myAvatar}));
			}
		});
		clearTargetMessage();
		clearFinalTarget();
		hideReplyToast();
		closeStickersPanel();
	}
});

document.getElementById('more').addEventListener('click', ()=>{
	document.getElementById('sidebar_wrapper').classList.add('active');
	//document.getElementById('focus_glass').classList.add('active');
	addFocusGlass();
});

let timeoutClone;
document.querySelectorAll('.keyCopy').forEach(elem => {
	elem.addEventListener('click', (evt)=>{
		const target = evt.target.closest('.keyCopy').querySelector('.fa-clone');
		target.classList.replace('fa-clone', 'fa-check');
		target.classList.replace('fa-regular', 'fa-solid');
		target.style.color = 'var(--secondary-dark)';
		if (timeoutClone) {clearTimeout(timeoutClone);}
		timeoutClone = setTimeout(() => {
			target.classList.replace('fa-check', 'fa-clone');
			target.classList.replace('fa-solid', 'fa-regular');
			target.style.color = 'var(--secondary-dark)';
			timeoutClone = undefined;
		}, 1000);
		copyText(myKey);
	});
});

document.getElementById('invite').addEventListener('click', async () =>{
	//copy inner link
	try {
		if (!navigator.share){
			popupMessage('Sharing in not supported by this browser');
			return;
		}
		await navigator.share({
			title: 'Poketab Messanger',
			text: 'Join chat!',
			url: `https://${window.location.host}/join/${myKey}`,
		});
		popupMessage('Shared!');
	} catch (err) {
		popupMessage(`${err}`);
	}
});

document.querySelector('.theme_option').addEventListener('click', ()=>{
	hideOptions();
	if(THEME){
		if (themeArray.includes(THEME) == false){
			THEME = 'blue';
			localStorage.setItem('theme', THEME);
		}
		document.querySelector('.themeChooser').querySelectorAll('.theme').forEach(theme => {
			theme.querySelector('img').style.border = '';
		});
		document.querySelector(`.themeChooser #${THEME}`).querySelector('img').style.border = '2px solid var(--secondary-dark)';
	}
	//document.getElementById('focus_glass').classList.add('active');
	addFocusGlass();
	document.querySelector('.themeChooser').classList.add('active');
});

document.querySelector('.themeChooser').addEventListener('click', ()=>{
	document.querySelector('.themeChooser').classList.remove('active');
	hideOptions();
});

document.querySelectorAll('.theme').forEach(theme => {
	theme.addEventListener('click', (evt) => {
		THEME = evt.target.closest('li').id;
		localStorage.setItem('theme', THEME);
		console.log(`Theme changed to ${THEME}`);
		//edit css variables
		document.documentElement.style.setProperty('--pattern', `url('../images/backgrounds/${THEME}_w.webp')`);
		document.documentElement.style.setProperty('--secondary-dark', themeAccent[THEME].secondary);
		document.documentElement.style.setProperty('--msg-get', themeAccent[THEME].msg_get);
		document.documentElement.style.setProperty('--msg-get-reply', themeAccent[THEME].msg_get_reply);
		document.documentElement.style.setProperty('--msg-send', themeAccent[THEME].msg_send);
		document.documentElement.style.setProperty('--msg-send-reply', themeAccent[THEME].msg_send_reply);
		document.querySelector('.themeChooser').classList.remove('active');
		document.querySelector('meta[name="theme-color"]').setAttribute('content', themeAccent[THEME].secondary);
		hideOptions();
	});
});

showMoreReactBtn.addEventListener('click', ()=>{
	updateReactsChooser();
});

function updateReactsChooser(){
	const container = document.querySelector('.reactOptionsWrapper');
	const closed = container.dataset.closed == 'true';
	if (closed){
		//container.style.maxHeight = '200px';
		container.dataset.closed = 'false';
		//container.querySelector('.fa-solid').classList.replace('fa-plus', 'fa-chevron-up');
		document.querySelector('.moreReactsContainer').classList.add('active');
	}else{
		//container.style.maxHeight = '35px';
		container.dataset.closed = 'true';
		//container.querySelector('.fa-solid').classList.replace('fa-chevron-up', 'fa-plus');
		document.querySelector('.moreReactsContainer').classList.remove('active');
	}
}

document.querySelector('.moreReacts').addEventListener('click', (evt)=>{
	const target = evt.target;
	//if target is not self
	if (target.classList.contains('react-emoji')){
		const react = target.textContent;
		sendReact(react);
		hideOptions();
	}
}); 

messages.addEventListener('scroll', () => {
	scroll = messages.scrollTop;
	const scrolled = lastPageLength-scroll;
	if (scroll <= lastPageLength) {
		if (scrolled >= 50){   
			scrolling = true;
		}
		if (scrolled == 0){
			document.querySelector('.newmessagepopup').classList.remove('active');
			scrolling = false;
		}
	}
	else {
		lastPageLength = scroll;
		removeNewMessagePopup();
		//document.getElementById('backToBottom').classList.remove('active');
		scrolling = false;
	}
	if (scrolled >= 300){
		//document.getElementById('backToBottom').classList.add('active');
		document.querySelector('.newmessagepopup img').style.display = 'none';
		document.querySelector('.newmessagepopup .msg').style.display = 'none';
		document.querySelector('.newmessagepopup .downarrow').style.display = 'block';
		document.querySelector('.newmessagepopup').classList.add('active');
	}
});


textbox.addEventListener('input' , function () {
	resizeTextbox();
	typingStatus();
});

document.querySelector('.newmessagepopup').addEventListener('click', function () {
	scrolling = false;
	updateScroll();
	removeNewMessagePopup();
});

document.getElementById('logout').addEventListener('click', () => {
	document.getElementById('preload').querySelector('.text').textContent = 'Logging out';
	document.getElementById('preload').style.display = 'flex';
	window.location.href = '/';
});


replyToast.querySelector('.close').addEventListener('click', ()=>{
	clearTargetMessage();
	clearFinalTarget();
	hideReplyToast();
});

document.addEventListener('contextmenu', event => event.preventDefault());


lightboxClose.addEventListener('click', () => {
	document.getElementById('lightbox').classList.remove('active');
	//document.getElementById('lightbox__image').innerHTML = '';
	while (document.getElementById('lightbox__image').firstChild) {
		document.getElementById('lightbox__image').removeChild(document.getElementById('lightbox__image').firstChild);
	}
});

textbox.addEventListener('focus', function () {
	updateScroll();
});

textbox.addEventListener('blur', ()=>{
	focusInput();
});

function focusInput(){
	if (softKeyIsUp){
		textbox.focus();
	}
}

document.querySelector('.close_area').addEventListener('click', () => {
	document.getElementById('sidebar_wrapper').classList.remove('active');
	hideOptions();
});

document.getElementById('attmain').addEventListener('click', () => {
	document.getElementById('attmain').classList.remove('active');
	setTimeout(()=>{
		document.getElementById('attmain').style.display = 'none';
	}, 10);
});

document.getElementById('attachment').addEventListener('click', ()=>{
	document.getElementById('attmain').style.display = 'flex';
	setTimeout(()=>{
		document.getElementById('attmain').classList.add('active');
	}, 10);
});

document.querySelector('.reactOptionsWrapper').addEventListener('click', (evt) => {
	//stop parent event
	if (evt.target.classList.contains('reactOptionsWrapper')){
		hideOptions();
	}
});

let backToNormalTimeout = undefined;
let scrollIntoViewTimeout = undefined;
messages.addEventListener('click', (evt) => {
	try {
		let msgTimeTimeout = undefined;
		if (evt.target?.closest('.message')?.contains(evt.target) && !evt.target?.classList.contains('message')){
			evt.target?.closest('.message')?.querySelector('.messageTime')?.classList?.add('active');
			if (msgTimeTimeout){
				clearTimeout(msgTimeTimeout);
			}
			msgTimeTimeout = setTimeout(()=>{
				evt.target?.closest('.message')?.querySelector('.messageTime')?.classList?.remove('active');
				msgTimeTimeout = undefined;
			}, 1500);
		}
		if (evt.target?.classList?.contains('image') && !evt.target?.classList?.contains('imageReply')){
			evt.preventDefault();
			evt.stopPropagation();
			if (evt.target.closest('.message')?.dataset.downloaded != 'true'){  
				if (evt.target.closest('.message')?.dataset.uid == myId){
					popupMessage('Not sent yet');
				}else{
					popupMessage('Not downloaded yet');
				}
				console.log('%cNot availabe yet', 'color: blue');
				return;
			}
			//document.getElementById('lightbox__image').innerHTML = `<img src=${evt.target?.src} class='lb'>`;
			while (document.getElementById('lightbox__image').firstChild) {
				document.getElementById('lightbox__image').removeChild(document.getElementById('lightbox__image').firstChild);
			}

			const imageElement = document.createElement('img');
			imageElement.src = evt.target?.src;
			imageElement.classList.add('lb');
			document.getElementById('lightbox__image').appendChild(imageElement);

			//pinchZoom(document.getElementById('lightbox__image').querySelector('img'));
			// eslint-disable-next-line no-undef
			PanZoom(document.getElementById('lightbox__image').querySelector('img'));

			document.getElementById('lightbox').classList.add('active');
		}
		else if (evt.target?.classList?.contains('reactsOfMessage') || evt.target?.parentNode?.classList?.contains('reactsOfMessage')){
			const target = evt.target?.closest('.message')?.querySelectorAll('.reactedUsers .list');
			const container = document.querySelector('.reactorContainer ul');
			//container.innerHTML = '';
			while (container.firstChild) {
				container.removeChild(container.firstChild);
			}
			if (target.length > 0){
				target.forEach(element => {
					//let avatar = userList.find(user => user.uid == element.dataset.uid).avatar;
					const avatar = userInfoMap.get(element.dataset.uid).avatar;
					//let name = userList.find(user => user.uid == element.dataset.uid).name;
					let name = userInfoMap.get(element.dataset.uid).name;
					if (name == myName){name = 'You';}
					const listItem = document.createElement('li');
					const avatarImage = document.createElement('img');
					avatarImage.src = `/images/avatars/${avatar}(custom).png`;
					avatarImage.height = 30;
					avatarImage.width = 30;
					const nameSpan = document.createElement('span');
					nameSpan.classList.add('uname');
					nameSpan.textContent = name;
					const reactSpan = document.createElement('span');
					reactSpan.classList.add('r');
					reactSpan.textContent = element.textContent;
					listItem.append(avatarImage, nameSpan, reactSpan);
					if (element.dataset.uid == myId){
						container.prepend(listItem);
					}else{
						container.appendChild(listItem);
					}
				});
			}
			hideOptions();
			document.querySelector('.reactorContainerWrapper').classList.add('active');
			//document.getElementById('focus_glass').classList.add('active');
			addFocusGlass(false);
		}

		else if (evt.target?.closest('.messageReply') || evt.target?.closest('.imageReply')){
			if (document.getElementById(evt.target.closest('.messageReply').dataset.repid).dataset.deleted != 'true'){
				try{
					const target = evt.target.closest('.messageReply')?.dataset.repid;
					document.querySelectorAll('.message').forEach(element => {
						if (element.id != target){
							element.style.filter = 'brightness(0.7)';
						}
					});
					if (backToNormalTimeout){
						clearTimeout(backToNormalTimeout);
					}
					backToNormalTimeout = setTimeout(() => {
						document.querySelectorAll('.message').forEach(element => {
							element.style.filter = '';
						});
						backToNormalTimeout = undefined;
					}, 1000);
					if (scrollIntoViewTimeout){
						clearTimeout(scrollIntoViewTimeout);
					}
					scrollIntoViewTimeout = setTimeout(() => {
						document.getElementById(target).scrollIntoView({behavior: 'smooth', block: 'start'});
						scrollIntoViewTimeout = undefined;
					}, 100);
				}catch(e){
					popupMessage('Deleted message');
				}
			}else{
				popupMessage('Deleted message');
			}
		}
		else{
			hideOptions();
		}
	}catch(e){
		console.log('Message does not exist', e);
	}
});


document.querySelector('.reactorContainerWrapper').addEventListener('click', (evt) => {
	if (evt.target.classList.contains('reactorContainerWrapper')){
		hideOptions();
	}
});

window.addEventListener('resize',()=>{
	appHeight();
	const temp = scrolling;
	//last added
	lastPageLength = messages.scrollTop;
	setTimeout(()=>{
		scrolling = false;
		updateScroll();
	}, 10);
	scrolling = temp;
	softKeyIsUp = maxWindowHeight > window.innerHeight ? true : false;
});

replyOption.addEventListener('click', showReplyToast);
copyOption.addEventListener('click', () => {
	hideOptions();
	copyText(null);
});
downloadOption.addEventListener('click', downloadHandler);
deleteOption.addEventListener('click', ()=>{
	const uid = document.getElementById(targetMessage.id)?.dataset?.uid;
	if (uid){
		hideOptions();
		socket.emit('deletemessage', targetMessage.id, uid, myName, myId);
	}
});

photoButton.addEventListener('change', ()=>{
	ImagePreview();
});

fileButton.addEventListener('change', ()=>{
	FilePreview();
});

function ImagePreview(fileFromClipboard = null){
	const file = fileFromClipboard || photoButton.files[0];

	if (file.size > 15 * 1024 * 1024){
		popupMessage('File size too large');
		return;
	}

	document.getElementById('previewImage').querySelector('#imageSend').style.display = 'none';
	while (document.getElementById('selectedImage').firstChild) {
		document.getElementById('selectedImage').removeChild(document.getElementById('selectedImage').firstChild);
	}

	const loadingElement = document.createElement('span');
	loadingElement.classList.add('load');
	loadingElement.style.color = themeAccent[THEME].secondary;
    
	const loadingIcon = document.createElement('i');
	loadingIcon.classList.add('fa-solid', 'fa-gear', 'fa-spin');

	loadingElement.textContent = 'Reading binary data';
	loadingElement.append(loadingIcon);
	document.getElementById('selectedImage').append(loadingElement);
	document.getElementById('previewImage')?.classList?.add('active');

	/*
	let reader = new FileReader();
	reader.readAsDataURL(file);
	reader.onload = (e) => {
		let data = e.target.result;
		//localStorage.setItem('selectedImage', data);
		selectedImage.data = data;
		selectedImage.name = file.name;
		selectedImage.ext = file.type;
		selectedImage.size = file.size;
		selectedObject = 'image';
		//document.getElementById('selectedImage').innerHTML = `<img src="${data}" alt="image" class="image-message" />`;
		while (document.getElementById('selectedImage').firstChild) {
			document.getElementById('selectedImage').removeChild(document.getElementById('selectedImage').firstChild);
		}
		const imageElement = document.createElement('img');
		imageElement.src = data;
		imageElement.alt = 'image';
		imageElement.classList.add('image-message');
		document.getElementById('selectedImage').append(imageElement);
		document.getElementById('previewImage').querySelector('#imageSend').style.display = 'flex';
	};
	*/

	const fileURL = URL.createObjectURL(file);
	const imageElement = document.createElement('img');
	imageElement.src = fileURL;
	imageElement.alt = 'image';
	imageElement.classList.add('image-message');
	imageElement.onload = () => {
		loadingElement.remove();
		document.getElementById('selectedImage').append(imageElement);
		document.getElementById('previewImage').querySelector('#imageSend').style.display = 'flex';
		selectedImage.data = fileURL;
		selectedImage.name = file.name ?? 'Photo';
		selectedImage.ext = file.type.split('/')[1];

		selectedImage.size = file.size;
		selectedObject = 'image';
	};
	imageElement.onerror = () => {
		URL.revokeObjectURL(fileURL);
		loadingElement.remove();
		popupMessage('Error reading file');
	};
	
	//clear photoButton
	photoButton.value = '';
	fileButton.value = '';
}

function FilePreview(fileFromClipboard = null){
	document.getElementById('previewImage').querySelector('#imageSend').style.display = 'none';
	while (document.getElementById('selectedImage').firstChild) {
		document.getElementById('selectedImage').removeChild(document.getElementById('selectedImage').firstChild);
	}

	const loadingElement = document.createElement('span');
	loadingElement.classList.add('load');
	loadingElement.style.color = themeAccent[THEME].secondary;
    
	const loadingIcon = document.createElement('i');
	loadingIcon.classList.add('fa-solid', 'fa-gear', 'fa-spin');

	loadingElement.textContent = 'Reading binary data';
	loadingElement.append(loadingIcon);
	document.getElementById('selectedImage').append(loadingElement);

	document.getElementById('previewImage')?.classList?.add('active');
	const file = fileFromClipboard || fileButton.files[0];
	let filename = file.name;
	let size = file.size;
	const ext = file.type.split('/')[1];

	//convert to B, KB, MB
	if (size < 1024){
		size = size + 'b';
	}else if (size < 1048576){
		size = (size/1024).toFixed(1) + 'kb';
	}else{
		size = (size/1048576).toFixed(1) + 'mb';
	}
	//if file more than 15 mb
	if (file.size > 15000000){
		popupMessage('File size must be less than 15 mb');
		document.getElementById('previewImage')?.classList.remove('active');
		while (document.getElementById('selectedImage').firstChild) {
			document.getElementById('selectedImage').removeChild(document.getElementById('selectedImage').firstChild);
		}
		return;
	}

	selectedFile.data = file;
	selectedFile.name = sanitize(shortFileName(filename));
	selectedFile.size = size;
	selectedFile.ext = ext;
	selectedObject = 'file';
	//document.getElementById('selectedImage').innerHTML = `<img src="${data}" alt="image" class="image-message" />`;
	while (document.getElementById('selectedImage').firstChild) {
		document.getElementById('selectedImage').removeChild(document.getElementById('selectedImage').firstChild);
	}
	
	filename = selectedFile.name;
	filename = filename.length >= 25 ? filename.substring(0, 10) + '...' + filename.substring(filename.length - 10, filename.length) : filename;
	const fileElement = document.createElement('div');
	fileElement.classList.add('file_preview');
	const fileIcon = document.createElement('i');
	fileIcon.classList.add('fa-regular', 'fa-file-lines');
	const fileName = document.createElement('div');
	fileName.textContent = `File: ${filename}`;
	const fileSize = document.createElement('div');
	fileSize.textContent = `Size: ${size}`;
	fileElement.append(fileIcon, fileName, fileSize);
	document.getElementById('selectedImage').appendChild(fileElement);
	document.getElementById('previewImage').querySelector('#imageSend').style.display = 'flex';

	//clear photoButton 
	photoButton.value = '';
	fileButton.value = '';
}

/*
const extMapFromBase64 = {
	'data:image/jpeg;base64': 'jpg',
	'data:image/png;base64': 'png',
	'data:image/gif;base64': 'gif',
	'data:image/bmp;base64': 'bmp',
	'data:image/webp;base64': 'webp',
	'data:image/tiff;base64': 'tiff',
	'data:image/x-icon;base64': 'ico',
	'data:application/pdf;base64': 'pdf',
	'data:application/zip;base64': 'zip',
	'data:application/x-rar-compressed;base64': 'rar',
	'data:application/x-7z-compressed;base64': '7z',
	'data:application/x-tar;base64': 'tar', 
	'data:application/x-bzip;base64': 'bz',
	'data:application/x-bzip2;base64': 'bz2',
	'data:application/x-gzip;base64': 'gz',
	'data:application/x-xz;base64': 'xz',
	//audio
	'data:audio/mpeg;base64': 'mp3',
	'data:audio/ogg;base64': 'ogg',
	'data:audio/wav;base64': 'wav',
	'data:audio/x-wav;base64': 'wav',
	'data:audio/x-pn-wav;base64': 'wav',
	'data:audio/x-ms-wma;base64': 'wma',
	'data:audio/x-ms-wax;base64': 'wax',
	'data:audio/x-aiff;base64': 'aif',
	'data:audio/x-mpegurl;base64': 'm3u',
	'data:audio/x-scpls;base64': 'pls',
	'data:audio/x-mpeg;base64': 'mp2',
	'data:audio/x-m4a;base64': 'm4a',
	'data:audio/x-realaudio;base64': 'ra',
	//video
	'data:video/mpeg;base64': 'mpeg',
	'data:video/mp4;base64': 'mp4',
	'data:video/quicktime;base64': 'mov',
	'data:video/x-msvideo;base64': 'avi',
	'data:video/x-ms-wmv;base64': 'wmv',
	'data:video/x-ms-asf;base64': 'asf',
	'data:video/x-flv;base64': 'flv',
	'data:video/x-m4v;base64': 'm4v',
	'data:video/x-matroska;base64': 'mkv',
	'data:video/x-mng;base64': 'mng',
	//text
	'data:text/plain;base64': 'txt',
	'data:text/html;base64': 'html',
	'data:text/css;base64': 'css',
	'data:text/javascript;base64': 'js',
	'data:text/xml;base64': 'xml',
	'data:text/csv;base64': 'csv',
	'data:text/x-csv;base64': 'csv',
	//programming languages
	'data:text/x-c;base64': 'c',
	'data:text/x-c++src;base64': 'cpp',
	'data:text/x-c++hdr;base64': 'hpp',
	'data:text/x-java;base64': 'java',
	'data:text/x-python;base64': 'py',
	'data:text/x-php;base64': 'php',
	'data:text/x-ruby;base64': 'rb',
	'data:text/x-sql;base64': 'sql',
	'data:text/x-csharp;base64': 'cs',
	//office
	'data:application/vnd.ms-excel;base64': 'xls',
	'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64': 'xlsx',
	'data:application/vnd.ms-powerpoint;base64': 'ppt',
	'data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64': 'pptx',
	'data:application/msword;base64': 'doc',
	'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64': 'docx',
	'data:application/vnd.oasis.opendocument.text;base64': 'odt',
	'data:application/vnd.oasis.opendocument.spreadsheet;base64': 'ods',
	'data:application/vnd.oasis.opendocument.presentation;base64': 'odp',
	'data:application/vnd.oasis.opendocument.graphics;base64': 'odg',
	'data:application/vnd.oasis.opendocument.chart;base64': 'odc',
	'data:application/vnd.oasis.opendocument.formula;base64': 'odf',
	//common windows files
	'data:application/x-msdownload;base64': 'exe',
	'data:application/x-msi;base64': 'msi',
	'data:application/x-ms-shortcut;base64': 'lnk',
	'data:application/x-ms-wmd;base64': 'wmd',
	'data:application/x-ms-wmz;base64': 'wmz',
	'data:application/x-ms-xbap;base64': 'xbap',
	'data:application/x-msaccess;base64': 'mdb',
	'data:application/x-msbinder;base64': 'obd',
	'data:application/x-mscardfile;base64': 'crd',
	'data:application/x-msclip;base64': 'clp',
	'data:application/x-msmediaview;base64': 'mvb',
	//common mac files
	'data:application/x-apple-diskimage;base64': 'dmg',
	'data:application/x-apple-keynote;base64': 'key',
	'data:application/x-apple-pages;base64': 'pages',
	'data:application/x-apple-numbers;base64': 'numbers',
	'data:application/x-apple-systemprofiler;base64': 'spf',
	'data:application/x-apple-diskcopy;base64': 'dmg',
	//common linux files
	'data:application/x-debian-package;base64': 'deb',
	'data:application/x-redhat-package-manager;base64': 'rpm',
	'data:application/x-compressed-tar;base64': 'tar.gz',
	//common android files
	'data:application/vnd.android.package-archive;base64': 'apk',
	//common ios files
	'data:application/x-itunes-ipa;base64': 'ipa',
	'data:application/x-itunes-ipg;base64': 'ipg',
	'data:application/x-itunes-ipsw;base64': 'ipsw',
	'data:application/x-itunes-ite;base64': 'ite',
	'data:application/x-itunes-itlp;base64': 'itlp',
	'data:application/x-itunes-itms;base64': 'itms',
	'data:application/x-itunes-itpc;base64': 'itpc',
	//common windows phone files
	'data:application/x-silverlight-app;base64': 'xap',
};

function getExt() {
	return extMapFromBase64[selectedFile.data.substring(0, selectedFile.data.indexOf(','))] || 'file';
}
*/


let timeoutObj;

window.addEventListener('dragover', (evt) => {
	evt.preventDefault();
	evt.stopPropagation();
	fileDropZone.classList.add('active');
	if (evt.target.classList.contains('fileDropZoneContent')){
		document.querySelector('.fileDropZoneContent').style.color = themeAccent[THEME].secondary;
		if (timeoutObj) {
			clearTimeout(timeoutObj);
		}
	}else{
		document.querySelector('.fileDropZoneContent').style.color = '#fff';
		if (timeoutObj) {
			clearTimeout(timeoutObj);
		}
	}
	timeoutObj = setTimeout(() => {
		fileDropZone.classList.remove('active');
		timeoutObj = undefined;
	}, 200);
});


window.addEventListener('drop', (evt) => {
	evt.preventDefault();
	fileDropZone.classList.remove('active');
	if (evt.target.classList.contains('fileDropZoneContent')){
		if (evt.dataTransfer.files.length > 0){
			if (evt.dataTransfer.files[0].type.includes('image')){
				ImagePreview(evt.dataTransfer.files[0]);
			}else{
				FilePreview(evt.dataTransfer.files[0]);
			}
		}
	}
});

window.addEventListener('offline', function() { 
	console.log('offline'); 
	document.querySelector('.offline .icon i').classList.replace('fa-wifi', 'fa-circle-exclamation');
	document.querySelector('.offline .text').textContent = 'You are offline!';
	document.querySelector('.offline').classList.add('active');
	document.querySelector('.chatBox').classList.add('offl');
	document.querySelector('.offline').style.background = 'var(--primary-dark)';
});

window.addEventListener('online', function() {
	console.log('Back to online');
	document.querySelector('.offline .icon i').classList.replace( 'fa-circle-exclamation', 'fa-wifi');
	document.querySelector('.offline .text').textContent = 'Back to online!';
	document.querySelector('.offline').style.background = 'limegreen';
	setTimeout(() => {
		document.querySelector('.offline').classList.remove('active');
		document.querySelector('.chatBox').classList.remove('offl');
	}, 1500);
});

sendButton.addEventListener('click', () => {
	let message = textbox.value?.trim();
	textbox.value = '';
    
	resizeTextbox();
	if (message.length) {
		const tempId = makeId();
		scrolling = false;
		if (message.length > 10000) {
			message = message.substring(0, 10000);
			message += '... (message too long)';
		}

		message = emojiParser(message);
		//replace spaces with unusual characters
		message = message.replace(/\n/g, '¶');
		message = message.replace(/>/g, '&gt;');
		message = message.replace(/</g, '&lt;');
		//message = message.replace(/\n/g, '<br/>');

		if (isEmoji(message)){
			//replace whitespace with empty string
			message = message.replace(/\s/g, '');
		}

		const replyData = finalTarget?.type === 'text' ? finalTarget?.message.substring(0, 100) : finalTarget?.message;

		insertNewMessage(message, 'text', tempId, myId, {data: replyData, type: finalTarget?.type}, finalTarget?.id, {reply: (finalTarget.message ? true : false), title: (finalTarget.message || maxUser > 2 ? true : false)}, {});
		socket.emit('message', message, 'text', myId, {data: replyData, type: finalTarget?.type}, finalTarget?.id, {reply: (finalTarget.message ? true : false), title: (finalTarget.message || maxUser > 2 ? true : false)}, function (id) {
			outgoingmessage.play();
			document.getElementById(tempId).classList.add('delevered');
			document.getElementById(tempId).id = id;
			lastSeenMessage = id;
			if (document.hasFocus()){
				socket.emit('seen', ({userId: myId, messageId: lastSeenMessage, avatar: myAvatar}));
			}
		});
	}
	finalTarget.message = '';
	finalTarget.type = '';
	finalTarget.sender = '';
	finalTarget.id = '';
	textbox.focus();
	hideOptions();
	hideReplyToast();
	try{
		clearTimeout(timeout);
	}catch(e){
		console.log('timeout not set');
	}
	isTyping = false;
	socket.emit('stoptyping');
});




document.getElementById('previewImage').querySelector('.close')?.addEventListener('click', ()=>{
	//remove file from input
	photoButton.value = '';
	fileButton.value = '';
	document.getElementById('previewImage')?.classList?.remove('active');
	//document.getElementById('selectedImage').innerHTML = '';
	while (document.getElementById('selectedImage').firstChild) {
		document.getElementById('selectedImage').removeChild(document.getElementById('selectedImage').firstChild);
	}
});

document.getElementById('previewImage').querySelector('#imageSend')?.addEventListener('click', ()=>{
	document.getElementById('previewImage')?.classList?.remove('active');
	//check if image or file is selected

	if (selectedObject === 'image'){
		//sendImage();
		sendImageStoreRequest();
	}else if (selectedObject === 'file'){
		sendFileStoreRequest();
	}

	hideReplyToast();
	//localStorage.removeItem('selectedImage');
});

async function sendImageStoreRequest(){
	const image = new Image();
	image.src = selectedImage.data;
	image.mimetype = selectedImage.ext;
	console.log(selectedImage.data);
	console.log(image);
	image.onload = async function() {

		const thumbnail = resizeImage(image, image.mimetype, 50);
		let tempId = makeId();
		scrolling = false;

		insertNewMessage(image.src, 'image', tempId, myId, {data: finalTarget?.message, type: finalTarget?.type}, finalTarget?.id, {reply: (finalTarget.message ? true : false), title: (finalTarget.message || maxUser > 2 ? true : false)}, {ext: image.mimetype, size: '', height: image.height, width: image.width, name: selectedFile.name});
		//socket.emit('Image', resized, 'image', tempId, myId, finalTarget?.message, finalTarget?.id, {reply: (finalTarget.message ? true : false), title: (finalTarget.message || maxUser > 2 ? true : false)});
		//store image in 100 parts

		const elem = document.getElementById(tempId)?.querySelector('.messageMain');
		elem.querySelector('.image').style.filter = 'brightness(0.4)';

		let progress = 0;
		fileSocket.emit('fileUploadStart', 'image', thumbnail.data, myId, {data: finalTarget?.message, type: finalTarget?.type}, finalTarget?.id, {reply: (finalTarget.message ? true : false), title: (finalTarget.message || maxUser > 2 ? true : false)}, {ext: image.mimetype, size: (image.width * image.height * 4) / 1024 / 1024, height: image.height, width: image.width, name: selectedFile.name}, myKey, (id) => {
			outgoingmessage.play();
			document.getElementById(tempId).classList.add('delevered');
			document.getElementById(tempId).id = id;
			tempId = id;
			lastSeenMessage = id;
			if (document.hasFocus()){
				socket.emit('seen', ({userId: myId, messageId: lastSeenMessage, avatar: myAvatar}));
			}
		});
        
		//make xhr request

		//image to file
		const file = await fetch(image.src).then(r => r.blob()).then(blobFile => new File([blobFile], 'image', {type: image.mimetype}));

		const formData = new FormData();
		formData.append('key', myKey);
		formData.append('ext', image.mimetype);
		formData.append('file', file);

		clearFinalTarget();
		//upload image via xhr request
		const xhr = new XMLHttpRequest();

		//send file via xhr post request
		xhr.open('POST', `${location.origin}/api/files`, true);
		xhr.upload.onprogress = function(e) {
			if (e.lengthComputable) {
				progress = (e.loaded / e.total) * 100;
				elem.querySelector('.sendingImage').textContent = '↑ ' + Math.round(progress) + '%';
				if (progress === 100){
					elem.querySelector('.sendingImage').textContent = 'Encoding...';
				}
			}
		};

		xhr.onload = function(e) {
			if (this.status == 200) {                
				if (elem){
					elem.querySelector('.sendingImage').remove();
					elem.querySelector('.image').style.filter = 'none';
				}
				document.getElementById(tempId).dataset.downloaded = 'true';
				fileSocket.emit('fileUploadEnd', tempId, myKey, JSON.parse(e.target.response).downlink);
			}
			else{
				console.log('error uploading image');
				elem.querySelector('.sendingImage').textContent = 'Upload failed';
				fileSocket.emit('fileUploadError', myKey, tempId, 'image');
			}
		};
		xhr.send(formData);
	};
}

async function sendFileStoreRequest(){
	let tempId = makeId();
	scrolling = false;

	const fileObject = new File([selectedFile.data], selectedFile.name, {type: selectedFile.ext});
	const fileUrl = URL.createObjectURL(fileObject);

	insertNewMessage(fileUrl, 'file', tempId, myId, {data: finalTarget?.message, type: finalTarget?.type}, finalTarget?.id, {reply: (finalTarget.message ? true : false), title: (finalTarget.message || maxUser > 2 ? true : false)}, {ext: selectedFile.ext, size: selectedFile.size, name: selectedFile.name});

	let progress = 0;
	const elem = document.getElementById(tempId)?.querySelector('.messageMain');

	fileSocket.emit('fileUploadStart', 'file', '', myId, {data: finalTarget?.message, type: finalTarget?.type}, finalTarget?.id, {reply: (finalTarget.message ? true : false), title: (finalTarget.message || maxUser > 2 ? true : false)}, {ext: selectedFile.ext, size: selectedFile.size, name: selectedFile.name}, myKey, (id) => {
		outgoingmessage.play();
		document.getElementById(tempId).classList.add('delevered');
		document.getElementById(tempId).id = id;
		tempId = id;
		lastSeenMessage = id;
		if (document.hasFocus()){
			socket.emit('seen', ({userId: myId, messageId: lastSeenMessage, avatar: myAvatar}));
		}
	});
	//document.getElementById(tempId).querySelector('.messageMain').style.filter = 'brightness(0.4)';
    
	const formData = new FormData();
	formData.append('key', myKey);
	formData.append('file', fileObject);

	clearFinalTarget();
	//upload image via xhr request
	const xhr = new XMLHttpRequest();
	//send file via xhr post request
	xhr.open('POST', location.origin + '/api/files', true);
	xhr.upload.onprogress = function(e) {
		if (e.lengthComputable) {
			progress = (e.loaded / e.total) * 100;
			elem.querySelector('.progress').textContent = '↑ ' + Math.round(progress) + '%';
			if (progress === 100){
				elem.querySelector('.progress').textContent = 'Encoding...';
			}
		}
	};

	xhr.onload = function(e) {

		if (this.status == 200) {
			//fileSocket.emit('fileUploadEnd', tempId, myKey, JSON.parse(e.target.response).downlink, (id) => {
			document.getElementById(tempId).dataset.downloaded = 'true';
			elem.querySelector('.progress').style.visibility = 'hidden';
			fileSocket.emit('fileUploadEnd', tempId, myKey, JSON.parse(e.target.response).downlink);
		}
		else{
			console.log('error uploading file');
			elem.querySelector('.progress').textContent = 'Upload failed';
			fileSocket.emit('fileUploadError', myKey, tempId, 'image');
		}
	};
	xhr.send(formData);
}

let newMsgTimeOut = undefined;

function notifyUser(message, username, avatar){
	if ( ('Notification' in window) && Notification.permission === 'granted') {
		// Check whether notification permissions have already been granted;
		// if so, create a notification
		if (!document.hasFocus()){
			document.querySelector('title').text = `${username} messaged`;
			if (newMsgTimeOut == undefined){
				newMsgTimeOut = setTimeout(() => {
					document.querySelector('title').text = 'Inbox';
					newMsgTimeOut = undefined;
				}, 3000);
			}
			//if (lastNotification != undefined) {lastNotification.close();}
			lastNotification = new Notification(username, {
				body: message.type == 'Text' ? message.data : message.type,
				icon: `/images/avatars/${avatar}(custom).png`,
				tag: username,
			});
		}
		// …
	} else if (Notification.permission !== 'denied') {
		// We need to ask the user for permission
		Notification.requestPermission().then((permission) => {
			// If the user accepts, let's create a notification
			if (permission === 'granted') {
				if (!document.hasFocus()){
					document.querySelector('title').text = `${username} messaged`;
					if (newMsgTimeOut == undefined){
						newMsgTimeOut = setTimeout(() => {
							document.querySelector('title').text = 'Inbox';
							newMsgTimeOut = undefined;
						}, 3000);
					}
					//if (lastNotification != undefined) {lastNotification.close();}
					lastNotification = new Notification(username, {
						body: message.type == 'Text' ? message.data : message.type,
						icon: `/images/avatars/${avatar}(custom).png`,
						tag: username,
					});
				}
			}
		});
	}   
}


document.getElementById('lightbox__save').addEventListener('click', ()=>{
	saveImage();
});


textbox.addEventListener('keydown', (evt) => {
	if (evt.ctrlKey && (evt.key === 'Enter')) {
		sendButton.click();
	}
});

document.getElementById('send-location').addEventListener('click', () => {
	popupMessage('Tracing your location...');
	if (!navigator.geolocation) {
		popupMessage('Geolocation not supported by your browser.');
		return;
	}
	navigator.geolocation.getCurrentPosition( (position) => {
		socket.emit('createLocationMessage', {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		});
	}, (error) => {
		popupMessage(error.message);
	});
});

/*
document.getElementById('createPollBtn').addEventListener('click', () => {
    console.log('initiating poll');
    popupMessage('Poll option will be available soon.');
});
*/

//play clicky sound on click on each clickable elements
document.querySelectorAll('.clickable').forEach(elem => {
	elem.addEventListener('click', () => {
		clickSound.currentTime = 0;
		clickSound.play();
	});
});

//listen for file paste
window.addEventListener('paste', (e) => {
	if (e.clipboardData) {
		const items = e.clipboardData.items;
		if (items) {
			for (let i = 0; i < items.length; i++) {
				if (items[i].kind === 'file') {
					const file = items[i].getAsFile();
					if (file.type.match('image.*')) {
						//localStorage.setItem('selectedImage', file);
						selectedImage.data = file;
						selectedImage.ext = file.type.split('/')[1];
						selectedFile.name = shortFileName(file.name);
						selectedFile.size = file.size;
						selectedObject = 'image';
						ImagePreview(file);
					}
				}
			}
		}
	}
}
);

function shortFileName(filename){
	if (filename.length > 30){
		//then shorten the filename as abc...[last10chars]
		filename = filename.substring(0, 10) + '...' + filename.substring(filename.length - 10, filename.length);
	}
	return filename;
}


//sockets
socket.on('connect', () => {
	const params = {
		name: myName,
		id: myId,
		avatar: myAvatar,
		key: myKey,
		maxuser: maxUser,
	};
	socket.emit('join', params, function(err){
		if (err) {
			console.log(err);
		} else {
			console.log('no error');
			if (userTypingMap.size > 0){
				document.getElementById('typingIndicator').textContent = getTypingString(userTypingMap);
			}
			document.getElementById('preload').style.display = 'none';
			popupMessage('Connected to server');
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
socket.on('updateUserList', users => {
	users.forEach(user => {
		userInfoMap.set(user.uid, user);
	});
	document.getElementById('count').textContent = `${users.length}/${maxUser}`;
	//document.getElementById('userlist').innerHTML = '';
	while (document.getElementById('userlist').firstChild) {
		document.getElementById('userlist').removeChild(document.getElementById('userlist').firstChild);
	}
	users.forEach(user => {
		//let html = `<li class="user" data-uid="${user.uid}"> <div class="avt"> <img src="/images/avatars/${user.avatar}(custom).png" height="30px" width="30px"/> <i class="fa-solid fa-circle activeStatus"></i> </div> ${user.uid == myId ? user.name + ' (You)' : user.name}</li>`;
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
		userSpan.textContent = user.uid == myId ? user.name + ' (You)' : user.name;
		listItem.append(avt, userSpan);
		if (user.uid == myId){
			//document.getElementById('userlist').innerHTML = html + document.getElementById('userlist').innerHTML;
			document.getElementById('userlist').prepend(listItem);
		}else{
			//document.getElementById('userlist').innerHTML += html;
			document.getElementById('userlist').appendChild(listItem);
		}
	});
});

socket.on('server_message', (meta, type) => {
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
	serverMessage(meta, type);
});

socket.on('newMessage', (message, type, id, uid, reply, replyId, options) => {
	if (type == 'text'){
		incommingmessage.play();
	}else if(type == 'sticker'){
		stickerSound.play();
	}
	insertNewMessage(message, type, id, uid, reply, replyId, options, {});
	notifyUser({data: type == 'text' ? message : '', type: type[0].toUpperCase()+type.slice(1)}, userInfoMap.get(uid)?.name, userInfoMap.get(uid)?.avatar);
});

socket.on('seen', meta => {
	const message = document.getElementById(meta.messageId);
	if (message && !message.dataset.seen?.includes(meta.userId)){
		document.querySelectorAll(`.msg-item[data-seen*="${meta.userId}"]`)
			.forEach(elem => {
				elem.querySelector(`.seenBy img[data-user="${meta.userId}"]`)?.remove();
				checkgaps(elem?.id);
			});

		message.dataset.seen = message.dataset.seen ? message.dataset.seen + '|' + meta.userId : meta.userId;
		const element = document.createElement('img');
		element.src = `/images/avatars/${meta.avatar}(custom)-mini.png`;
		element.dataset.user = meta.userId;
		message.querySelector('.seenBy').appendChild(element);
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
	typingsound.play();
	userTypingMap.set(id, user);
	document.getElementById('typingIndicator').textContent = getTypingString(userTypingMap);
});
  
socket.on('stoptyping', (id) => {
	userTypingMap.delete(id);
	if (userTypingMap.size == 0) {
		document.getElementById('typingIndicator').textContent = '';
	}else{
		document.getElementById('typingIndicator').textContent = getTypingString(userTypingMap);
	}
});

//on disconnect
socket.on('disconnect', () => {
	console.log('disconnected');
	popupMessage('Disconnected from server');
});
//files metadata will be sent on different socket
fileSocket.on('connect', () => {
	console.log('fileSocket connected');
	fileSocket.emit('join', myKey);
});

//gets an intermediate thumbnail and file metadata
fileSocket.on('fileDownloadStart', (type, thumbnail, id, uId, reply, replyId, options, metadata) => {
	incommingmessage.play();
	fileBuffer.set(id, {type: type, data: '', uId: uId, reply: reply, replyId: replyId, options: options, metadata: metadata});
	if (type === 'image'){
		insertNewMessage(thumbnail, type, id, uId, reply, replyId, options, metadata);
		const elem = document.getElementById(id).querySelector('.messageMain');
		setTimeout(() => {
			elem.querySelector('.image').style.filter = 'brightness(0.4) url(#sharpBlur)';
		}, 10);
	}else{
		insertNewMessage('', type, id, uId, reply, replyId, options, metadata);
		const elem = document.getElementById(id).querySelector('.messageMain');
		elem.querySelector('.progress').textContent = '↑ Uploading';
	}
	notifyUser({data: '', type: type[0].toUpperCase()+type.slice(1)}, userInfoMap.get(uId)?.name, userInfoMap.get(uId)?.avatar);
});

//if any error occurrs, the show the error
fileSocket.on('fileUploadError', (id, type) => {
	const element = document.getElementById(id).querySelector('.messageMain');
	let progressContainer;
	if (type === 'image'){
		progressContainer = element.querySelector('.sendingImage');
	}else{
		progressContainer = element.querySelector('.progress');
	}
	progressContainer.textContent = 'Upload Error';
});

//if the file has been uploded to the server by other users, then start downloading
fileSocket.on('fileDownloadReady', (id, downlink) => {
	if (!fileBuffer.has(id)){
		return;
	}
	const data = fileBuffer.get(id);
	const type = data.type;
	const element = document.getElementById(id).querySelector('.messageMain');
	let progressContainer;
	if (type === 'image'){
		progressContainer = element.querySelector('.sendingImage');
	}else{
		progressContainer = element.querySelector('.progress');
	}

	fileBuffer.delete(id);

	const xhr = new XMLHttpRequest();
	xhr.open('GET', `${location.origin}/api/download/${downlink}/${myKey}`, true);
	xhr.responseType = 'blob';
	xhr.onprogress = async function(e) {
		if (e.lengthComputable && progressContainer) {
			const percentComplete = Math.round((e.loaded / e.total) * 100);
			progressContainer.textContent = `↓ ${percentComplete}%`;
			if (percentComplete === 100){
				progressContainer.textContent = 'Converting...';
			}
		}
	};

	xhr.onload = function() {
		if (this.status == 200) {
			
			const file = this.response;
			const url = URL.createObjectURL(file);

			if (element){
				
				clearDownload(element, url, type);

				fileSocket.emit('fileDownloaded', myId, myKey, downlink);
				if (type === 'image'){
					//update the reply thumbnails with the detailed image if exists
					document.querySelectorAll(`.messageReply[data-repid="${id}"`)
						.forEach(elem => {
							elem.querySelector('.image').src = url;
						});
				}
			}
		}else if (this.status == 404){
			console.log('404');
			progressContainer.textContent = 'File deleted';
		}
	};
	xhr.send();
	updateScroll();
});

//clear the previous thumbnail when user gets the file completely
function clearDownload(element, fileURL, type){
	outgoingmessage.play();
	if (type === 'image'){
		setTimeout(() => {
			element.querySelector('.sendingImage').remove();
			element.querySelector('.image').src = fileURL;
			element.querySelector('.image').alt = 'image';
			element.querySelector('.image').style.filter = 'none';
		}, 10);
	}else if (type === 'file'){
		setTimeout(() => {
			element.querySelector('.file').dataset.data = fileURL;
			element.querySelector('.progress').style.visibility = 'hidden';
		}, 10);
	}
	element.closest('.message').dataset.downloaded = 'true';
}

//set the app height based on different browser topbar or bottom bar height
appHeight();

//scroll up the message container
updateScroll();

//on dom ready, show 'Slow internet' if 3 sec has been passed
document.addEventListener('DOMContentLoaded', () => {
	setTimeout(() => {
		document.getElementById('preload').querySelector('.text').textContent = 'Logging in';
	}, 1000);
	//show slow internet if 3 sec has been passed
	setTimeout(() => {
		document.getElementById('preload').querySelector('.text').textContent = 'Slow internet';
	}, 8000);
});


//This code blocks the back button to go back on the login page.
//This action is needed because if the user goes back, he/she has to login again. 
document.addEventListener('click', ()=> {
	history.pushState({}, '', '#init');
	history.pushState({}, '', '#initiated');
	history.pushState({}, '', '#inbox');
	window.onpopstate = ()=>{
		history.forward();
	};
}, {once: true});
