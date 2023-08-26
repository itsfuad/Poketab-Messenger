//enable strict mode
'use strict';

import { chatSocket } from './utils/messageSocket.js';
import { fileSocket, incommingXHR } from './utils/fileSocket.js';

import { Prism } from '../../libs/prism/prism.min.js';
import { PanZoom } from '../../libs/panzoom.min.js';
import { sanitizeImagePath, sanitize } from './utils/sanitizer.js';
import {
	getFormattedDate, reactArray, shortFileName, getTypingString, remainingTime
} from './utils/helperFunctions.js';

import {
	playReactSound, playStickerSound, playOutgoingSound, playClickSound, playStartRecordSound, playExpandSound,
} from './utils/media.js';

import { emojiParser, isEmoji, TextParser, parseTemplate } from './utils/messageParser.js';
import themeAccent, { themePicker, themeArray } from './utils/themes.js';

import { ClickAndHold } from './utils/clickAndHoldDetector.js';

import { fragmentBuilder } from './utils/fragmentBuilder.js';

import { setStickerKeyboardState } from './utils/stickersKeyboard.js';

import './utils/buttonsAnimate.js';
import { filterMessage } from './utils/badwords.js';


console.log('%cloaded app.js', 'color: deepskyblue;');

//main message Element where all messages araree inserted
const messages = document.getElementById('messages');

const textbox = document.getElementById('textbox'); //textbox element where user types messages

//all options in the message options menu when a user right clicks on a message or taps and holds on mobile
const copyOption = document.querySelector('.copyOption');
const downloadOption = document.querySelector('.downloadOption');
const deleteOption = document.querySelector('.deleteOption');
const replyOption = document.querySelector('.replyOption');
const fileDropZone = document.querySelector('.fileDropZone');
const showMoreReactBtn = document.getElementById('showMoreReactBtn');
//button elements
const recordButton = document.getElementById('recordVoiceButton');
const cancelVoiceRecordButton = document.getElementById('cancelVoiceRecordButton');
const recorderElement = document.getElementById('recorderOverlay');
const micIcon = document.getElementById('micIcon');
const recorderTimer = document.getElementById('recordingTime');

//dynamic popups
const stickersPanel = document.getElementById('stickersKeyboard');
const sideBarPanel = document.getElementById('sidebarWrapper');
const quickSettings = document.getElementById('quickSettingPanel');
const messageOptions = document.getElementById('messageOptionsContainerWrapper');
const filePreviewContainer = document.getElementById('filePreviewContainer');
const filePreviewOptions = document.getElementById('filePreviewOptions');
const selectedFilesCount = document.getElementById('items-count');
const expandReactButton = document.getElementById('expandReactButton');
const moreReactsContainer = document.getElementById('moreReactsContainer');

const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxSaveButton = document.getElementById('lightboxSaveButton');
const lightboxCloseButton = document.getElementById('lightboxCloseButton');

//popups closearea
const attachmentCloseArea = document.getElementById('attachmentCloseArea');

//use a global variable to store the recorded audio
/**
 * @type {HTMLAudioElement} recordedAudio
 */
let recordedAudio;
const audioChunks = [];
/**
 * @type {MediaStream} stream
 */
let stream;
/**
 * @type {number} timerInterval
 */
let timerInterval;
/**
 * @type {number} autoStopRecordtimeout
 */
let autoStopRecordtimeout;
let recordCancel = false;

//three main types of messages are sent in the app by these three buttons
const sendButton = document.getElementById('send');
const fileSendButton = document.getElementById('fileSendButton');

const photoButton = document.getElementById('photoChooser');
const fileButton = document.getElementById('fileChooser');
const audioButton = document.getElementById('audioChooser');

export let isTyping = false;
let messageTimeStampUpdater = undefined;

//all the variables that are fetched from the server
export const myId = document.getElementById('myId').textContent;
export const myName = document.getElementById('myName').textContent;
export const myAvatar = document.getElementById('myAvatar').textContent;
export const myKey = document.getElementById('myKey').textContent;
export const maxUser = document.getElementById('maxUser').textContent;

//template messages
const messageTemplate = document.getElementById('messageTemplate').innerHTML;
const fileTemplate = document.getElementById('fileTemplate').innerHTML;
const audioTemplate = document.getElementById('audioMessageTemplate').innerHTML;

//remove the templates from the dom to make it invisible
document.getElementById('userMetaTemplate').remove();
document.getElementById('messageTemplate').remove();
document.getElementById('fileTemplate').remove();
document.getElementById('audioMessageTemplate').remove();

let scrolling = false; //to check if user is scrolling or not
let lastPageLength = messages.scrollTop; // after adding a ^(?!\s*//).*console\.lognew message the page size gets updated
let scroll = 0; //total scrolled up or down by pixel

export let messageSoundEnabled = true; //message sound is enabled by default
export let buttonSoundEnabled = true; //button sound is enabled by default

//here we add the usernames who are typing
export const userTypingMap = new Map();
//all the user and their info is stored in this map
export const userInfoMap = new Map();
//all file meta data is stored in this map which may arrive later
export const fileBuffer = new Map();

const messageparser = new TextParser();
//map of all the modals close functions
const modalCloseMap = new Map();
//list of active modals
const activeModals = [];

const ongoingXHR = new Map();

/**
 * This array stores the selected files to be sent
 */
const selectedFileArray = [];

/**
 * Selected file type [e.g. image, audio, file]
 */
let selectedObject = '';

/**
 * The message which fires the message handle event
 */
const targetMessage = {
	sender: '',
	message: '',
	type: '',
	id: '',
};
/**
 * The file which fires  message handle event
 */
const targetFile = {
	fileName: '',
	fileData: '',
	ext: '',
};

/**
 * after the message is varified we store the message info here
 */
let finalTarget = {
	sender: '',
	message: '',
	type: '',
	id: '',
};

let lastSeenMessage = null;
let lastNotification = undefined;

//current theme
let THEME = '';
let quickReactEmoji;
let messageSendShortCut = 'Ctrl+Enter'; //send message by default by pressing ctrl+enter

//first load functions 
//if user device is mobile
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

//detect if user is using a mobile device, if yes then use the click and hold class
if (isMobile) {
	ClickAndHold.applyTo(messages, 240, (evt) => {
		const isDeleted = evt.target.closest('.message').dataset.deleted == 'true' ? true : false;
		if (!isDeleted) {
			OptionEventHandler(evt);
		}
	});
}

//is user is not using a mobile device then we use the mouse click event
if (!isMobile) {
	messages.addEventListener('contextmenu', (evt) => {
		evt.preventDefault();
		evt.stopPropagation();
		if (evt.button == 2) {
			const isMessage = evt.target.closest('.message') ?? false;
			const isDeleted = evt.target.closest('.message')?.dataset.deleted == 'true' ? true : false;
			if (isMessage && !isDeleted) {
				OptionEventHandler(evt);
			}
		}
	});
}

let quickReactsEnabled = localStorage.getItem('quickReactsEnabled');

function checkQuickReactsEnabled(){
	if (quickReactsEnabled == 'true') {
		document.getElementById('quickEmoji').checked = true;
		sendButton.dataset.role = 'quickEmoji';
		document.getElementById('chooseQuickEmojiButton').disabled = false;
	}else if(quickReactsEnabled == 'false'){
		document.getElementById('quickEmoji').checked = false;
		sendButton.dataset.role = 'send';
		document.getElementById('chooseQuickEmojiButton').disabled = true;
	}else{
		quickReactsEnabled = 'true';
		document.getElementById('quickEmoji').checked = true;
		sendButton.dataset.role = 'quickEmoji';
		document.getElementById('chooseQuickEmojiButton').disabled = false;
	}
}

checkQuickReactsEnabled();

document.getElementById('quickEmoji').addEventListener('change', ()=>{
	quickReactsEnabled = document.getElementById('quickEmoji').checked ? 'true' : 'false';
	localStorage.setItem('quickReactsEnabled', quickReactsEnabled);
	checkQuickReactsEnabled();
});

//! functions

/**
 * Loads the reacts from the Defined array of reacts and inserts on the DOM
 */
function loadReacts() {
	//load all the reacts from the react object
	const reactOptions = document.getElementById('reactOptions');
	for (let i = 0; i < reactArray.primary.length - 1; i++) {

		const reactWrapperFragment = fragmentBuilder({
			tag: 'div',
			attr: {
				class: 'reactWrapper',
				'data-react': reactArray.primary[i],
			},
			child: {
				tag: 'div',
				attr: {
					class: 'react-emoji',
				},
				text: reactArray.primary[i],
			}
		});

		reactOptions.insertBefore(reactWrapperFragment, reactOptions.lastElementChild);
	}

	let lastReact = localStorage.getItem('lastReact') || reactArray.last;

	if (!reactArray.expanded.includes(lastReact) || reactArray.primary.includes(lastReact)) {
		lastReact = '🌻';
	}

	const lastWrapperFragment = fragmentBuilder({
		tag: 'div',
		attr: {
			class: 'reactWrapper last',
			'data-react': lastReact,
		},
		child: {
			tag: 'div',
			attr: {
				class: 'react-emoji',
			},
			text: lastReact,
		}
	});

	reactOptions.insertBefore(lastWrapperFragment, reactOptions.lastElementChild);

	const moreReacts = document.querySelector('.moreReacts');

	for (let i = 0; i < reactArray.expanded.length; i++) {

		const moreReactWrapper = fragmentBuilder({
			tag: 'div',
			attr: {
				class: 'reactWrapper',
				'data-react': reactArray.expanded[i],
			},
			child: {
				tag: 'div',
				attr: {
					class: 'react-emoji',
				},
				text: reactArray.expanded[i],
			}
		});

		moreReacts.appendChild(moreReactWrapper);
	}
}

/**
 * Loads theme
 */
function loadTheme() {
	//append the theme to the DOM
	document.body.appendChild(themePicker);

	THEME = localStorage.getItem('theme');
	if (THEME == null || themeArray.includes(THEME) == false) {
		THEME = 'ocean';
		localStorage.setItem('theme', THEME);
	}
	document.documentElement.style.setProperty('--pattern', `url('../images/backgrounds/${THEME}_w.webp')`);
	document.documentElement.style.setProperty('--secondary-dark', themeAccent[THEME].secondary);
	document.documentElement.style.setProperty('--msg-get', themeAccent[THEME].msg_get);
	document.documentElement.style.setProperty('--msg-get-reply', themeAccent[THEME].msg_get_reply);
	document.documentElement.style.setProperty('--msg-send', themeAccent[THEME].msg_send);
	document.documentElement.style.setProperty('--msg-send-reply', themeAccent[THEME].msg_send_reply);
	document.querySelector('meta[name="theme-color"]').setAttribute('content', themeAccent[THEME].secondary);
	
	const quickEmojiFromLocalStorage = localStorage.getItem('quickEmoji');
	//console.log(quickEmojiFromLocalStorage, themeAccent[THEME]);
	if (quickEmojiFromLocalStorage) {
		//console.log(`Found in local storage: ${quickEmojiFromLocalStorage}`);
		if (reactArray.expanded.includes(quickEmojiFromLocalStorage)) {
			quickReactEmoji = quickEmojiFromLocalStorage;
			//console.log(`Quick Emoji in expanded emojis: ${quickReactEmoji}`);
		}else{
			quickReactEmoji = themeAccent[THEME].quickEmoji;
			//console.log(`Setting from theme: ${quickReactEmoji}`);
		}
	}else{
		quickReactEmoji = themeAccent[THEME].quickEmoji;
		//console.log(`Not found in local storage: ${quickEmojiFromLocalStorage}`);
	}

	localStorage.setItem('quickEmoji', quickReactEmoji);
	//console.log(`Quick Emoji: ${quickReactEmoji}`);

	if (quickReactsEnabled == 'true'){
		sendButton.innerHTML = `<span class="quickEmoji">${quickReactEmoji}</span>`;
	}else{
		sendButton.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
	}
}
/**
 * Loads the send shortcut
 */
function loadSendShortcut() {
	try {
		if (messageSendShortCut === 'Ctrl+Enter') {
			messageSendShortCut = 'Ctrl+Enter';
			document.getElementById('Ctrl+Enter').checked = true;
			textbox.setAttribute('enterkeyhint', 'enter');
		} else if (messageSendShortCut === 'Enter') {
			document.getElementById('Enter').checked = true;
			messageSendShortCut = 'Enter';
			localStorage.setItem('sendBy', messageSendShortCut);
			textbox.setAttribute('enterkeyhint', 'send');
		} else {
			if (isMobile) {
				messageSendShortCut = 'Ctrl+Enter';
				document.getElementById('Ctrl+Enter').checked = true;
				textbox.setAttribute('enterkeyhint', 'enter');
			} else {
				messageSendShortCut = 'Enter';
				document.getElementById('Enter').checked = true;
				localStorage.setItem('sendBy', messageSendShortCut);
				textbox.setAttribute('enterkeyhint', 'send');
			}
		}
		document.getElementById('send').title = messageSendShortCut;
	} catch (e) {
		console.log(`Error: ${e}`);
	}
}
/**
 * Loads the button sound preference
 */
function loadButtonSoundPreference() {
	const sound = localStorage.getItem('buttonSoundEnabled');
	if (sound === 'false') {
		buttonSoundEnabled = false;
		document.getElementById('buttonSound').removeAttribute('checked');
	} else {
		buttonSoundEnabled = true;
		localStorage.setItem('buttonSoundEnabled', true);
		document.getElementById('buttonSound').setAttribute('checked', 'checked');
	}
}
/**
 * Loads the message sound preference
 */
function loadMessageSoundPreference() {
	const sound = localStorage.getItem('messageSoundEnabled');
	if (sound === 'false') {
		messageSoundEnabled = false;
		document.getElementById('messageSound').removeAttribute('checked');
	} else {
		messageSoundEnabled = true;
		localStorage.setItem('messageSoundEnabled', true);
		document.getElementById('messageSound').setAttribute('checked', 'checked');
	}
}

/**
 * Loads default settings
 */
function bootLoad() {
	messageSendShortCut = localStorage.getItem('sendBy');
	loadReacts();
	loadTheme();
	appHeight();
	updateScroll();
	loadSendShortcut();
	loadButtonSoundPreference();
	loadMessageSoundPreference();
}

bootLoad();


//sets the app height to the max height of the window
function appHeight() {
	const doc = document.documentElement;
	doc.style.setProperty('--app-height', `${window.innerHeight}px`);
}


/**
 * Inserts a new message on the DOM
 * @param {string} message The message to insert on DOM
 * @param {string} type Message type
 * @param {string} id Message id
 * @param {string} uid Senders id
 * @param {Object} reply Reply type and data object
 * @param {string} reply.type 
 * @param {string} reply.data 
 * @param {string} replyId 
 * @param {Object} replyOptions Options for message
 * @param {boolean} options.reply If the message contains a reply
 * @param {boolean} options.title If the message contains a title to show 
 * @param {Object} metadata File metadata
 * @param {string} metadata.height Image Height 
 * @param {string} metadata.width Image width 
 * @param {string} metadata.name FIle name 
 * @param {string} metadata.size File size 
 * @param {string} metadata.ext File extension
 * @param {number} metadata.duration number of seconds the audio file is
 * 
 */
export function insertNewMessage(message, type, id, uid, reply, replyId, replyOptions, metadata) {
	//detect if the message has a reply or not
	try {
		if (!replyOptions) {
			replyOptions = {
				reply: false,
				title: false
			};
		}

		makeMessgaes(message, type, id, uid, reply, replyId, replyOptions, metadata);
		
	} catch (err) {
		console.error(err);
		showPopupMessage(err);
	}
}

function makeMessgaes(message, type, id, uid, reply, replyId, replyOptions, metadata) {

	let classList = ''; //the class list for the message. Initially empty. 
	const lastMsg = messages.querySelector('.message:last-child'); //the last message in the chat box
	let popupmsg = ''; //the message to be displayed in the popup if user scrolled up
	const messageIsEmoji = isEmoji(message); //if the message is an emoji
	if (type === 'text') { //if the message is a text message
		message = `<div class="msg text">${messageparser.parse(message)}</div>`;
		const fragment = document.createDocumentFragment();
		const el = document.createElement('div');
		el.innerHTML = message;
		fragment.appendChild(el);
		popupmsg = fragment.textContent.length > 10 ? fragment.textContent.substring(0, 7) + '...' : fragment.textContent;//the message to be displayed in the popup if user scrolled up
	} else if (type === 'image') { //if the message is an image
		popupmsg = 'Image'; //the message to be displayed in the popup if user scrolled up
		message = sanitizeImagePath(message); //sanitize the image path
		message = `
		<div class='imageContainer msg'>
			<img class='image' src='${message}' alt='image' data-name='${metadata.name}' height='${metadata.height}' width='${metadata.width}' />
			<div class="circleProgressLoader" style="stroke-dasharray: 0, 251.2;">
				<svg class="animated inactive" viewbox="0 0 100 100">
					<circle cx="50" cy="50" r="45" fill="transparent"/>
					<path id="progress" stroke-linecap="round" stroke-width="3" stroke="#fff" fill="none"
						d="M50 10
							a 40 40 0 0 1 0 80
							a 40 40 0 0 1 0 -80">
					</path>
				</svg>
				<div class="progressPercent">Waiting for upload</div>
			</div>
		</div>
		`; //insert the image
	} else if (type === 'sticker') {
		popupmsg = 'Sticker';
		message = sanitizeImagePath(message);
		message = `
		<img class='sticker msg' src='/stickers/${message}.webp' alt='sticker' height='${metadata.height}' width='${metadata.width}' />
		`;
	} else if (type != 'text' && type != 'image' && type != 'file' && type != 'sticker' && type != 'audio') { //if the message is not a text or image message
		throw new Error('Invalid message type');
	}
	if (uid == myId) { //if the message is sent by the user is me
		classList += ' self';
	}

	if (lastMsg?.dataset?.uid != uid || messageIsEmoji || type === 'sticker') { // if the last message is not from the same user
		classList += ' newGroup'; //then add the new group class
		classList += ' start end';
	} else if (lastMsg?.dataset?.uid == uid) { //if the last message is from the same user
		if (!replyOptions.reply && !lastMsg?.classList.contains('emoji') && !lastMsg?.classList.contains('sticker')) { //and the message is not a reply
			lastMsg?.classList.remove('end'); //then remove the bottom corner rounded from the last message
		} else {
			classList += ' start';
		}
		classList += ' end';
	}
	if (messageIsEmoji) { //if the message is an emoji or sticker
		lastMsg?.classList.add('end');
		classList += ' emoji';
	}
	if (type === 'sticker') {
		lastMsg?.classList.add('end');
		classList += ' sticker';
	}
	if (!replyOptions.reply) {
		classList += ' noreply';
	}
	if ((!replyOptions.title || !classList.includes('start'))) {
		classList += ' notitle';
	}
	else if (classList.includes('self') && classList.includes('noreply')) {
		classList += ' notitle';
	}
	let username = userInfoMap.get(uid)?.username;
	const avatar = userInfoMap.get(uid)?.avatar;
	if (username == myName) { username = 'You'; }

	let html;
	let replyMsg;
	let repliedTo;
	if (replyOptions.reply) {
		//check if the replyid is available in the message list
		repliedTo = userInfoMap.get(document.getElementById(replyId || '')?.dataset?.uid)?.username;
		if (repliedTo == myName) { repliedTo = 'you'; }
		if (repliedTo == username) { repliedTo = 'self'; }
		if (!document.getElementById(replyId)) {
			reply = { data: 'Message is not available on this device', type: 'text' };
		}

		if (['text', 'file', 'audio'].includes(reply.type)) {
			replyMsg = sanitize(reply.data);
		} else {
			//replyMsg = document.getElementById(replyId)?.querySelector(`.messageMain .${reply.type}`).outerHTML.replace(`class="${reply.type}"`, `class="${reply.type} imageReply"`);
			const replyTarget = document.getElementById(replyId)?.querySelector(`.messageMain .${reply.type}`).cloneNode(true);
			//remove attributes
			replyTarget.removeAttribute('data-name');
			replyTarget.removeAttribute('style');
			replyTarget.removeAttribute('height');
			replyTarget.removeAttribute('width');
			replyTarget.setAttribute('alt', 'Reply');
			replyTarget.setAttribute('class', `${reply.type} imageReply`);
			replyMsg = replyTarget.outerHTML;
		}

	}

	const timeStamp = Date.now();

	if (type === 'file') {
		popupmsg = 'File';
		html = parseTemplate(fileTemplate, {
			classList: classList,
			avatarSrc: `/images/avatars/${avatar}(custom).webp`,
			messageId: id,
			uid: uid,
			type: type,
			repId: replyId,
			title: replyOptions.reply ? `${username} replied to ${repliedTo ? repliedTo : 'a message'}` : username,
			source: message,
			fileName: metadata.name,
			fileSize: metadata.size,
			ext: metadata.ext,
			replyMsg: replyMsg,
			replyFor: reply.type,
			time: getFormattedDate(timeStamp),
			timeStamp: timeStamp,
		});
	} else if (type == 'audio') {
		popupmsg = 'Audio';
		html = parseTemplate(audioTemplate, {
			classList: classList,
			avatarSrc: `/images/avatars/${avatar}(custom).webp`,
			messageId: id,
			uid: uid,
			type: type,
			repId: replyId,
			title: replyOptions.reply ? `${username} replied to ${repliedTo ? repliedTo : 'a message'}` : username,
			source: message,
			length: 'Play',
			ext: metadata.ext,
			replyMsg: replyMsg,
			replyFor: reply.type,
			time: getFormattedDate(timeStamp),
			timeStamp: timeStamp,
			duration: metadata.duration,
		});
	} else {
		html = parseTemplate(messageTemplate, {
			classList: classList,
			avatarSrc: `/images/avatars/${avatar}(custom).webp`,
			messageId: id,
			uid: uid,
			type: type,
			repId: replyId,
			title: replyOptions.reply ? `${username} replied to ${repliedTo ? repliedTo : 'a message'}` : username,
			message: message,
			replyMsg: replyMsg,
			replyFor: reply.type,
			time: getFormattedDate(timeStamp),
			timeStamp: timeStamp,
		});
	}

	lastSeenMessage = id;

	if (document.hasFocus()) {
		chatSocket.emit('seen', ({ userId: myId, messageId: lastSeenMessage, avatar: myAvatar }));
	}

	const fragment = document.createRange().createContextualFragment(html);

	messages.style.height = 'auto';
	messages.appendChild(fragment);
	const navbar = document.querySelector('.navbar');
	const footer = document.querySelector('.footer');
	messages.style.height = `calc(100vh - ${navbar.offsetHeight + footer.offsetHeight}px)`;

	if (reply.type == 'image' || reply.type == 'sticker') {
		document.getElementById(id).querySelector('.messageReply')?.classList.add('imageReply');
	}

	if (messageTimeStampUpdater) {
		clearInterval(messageTimeStampUpdater);
	}

	messageTimeStampUpdater = setInterval(() => {
		//get the last message
		const lastMsg = messages.querySelector('.msg-item:last-child');
		if (lastMsg?.classList?.contains('message')) {
			const time = lastMsg.querySelector('.messageTime');
			time.textContent = getFormattedDate(time.dataset.timestamp);
		}
	}, 10000);

	checkgaps(lastMsg?.id);

	//highlight code
	const codes = document.getElementById(id).querySelector('.messageMain')?.querySelectorAll('pre');

	if (type == 'text' && codes) {
		//Prism.highlightAll();
		codes.forEach(code => {
			code.querySelectorAll('code').forEach(c => {
				Prism.highlightElement(c);
			});
		});
	}

	setTimeout(() => {
		//console.log(uid, popupmsg);
		updateScroll(uid, popupmsg);
	}, 100);
}

/**
 * Shows Reply, Copy, Download, remove, Reacts options
 * @param {string} type Any of the [image, audio, file, text]
 * @param {boolean} sender True if Sender is me, else false 
 * @param {HTMLElement} target The message that fired the event 
 */
function showOptions(type, sender, target) {
	try {
		if (target == null) {
			return;
		}

		if (hideOptionsTimeout != null) {
			clearTimeout(hideOptionsTimeout);
		}

		//removes all showing options first if any
		document.querySelector('.reactorContainerWrapper').classList.remove('active');

		document.getElementById('reactOptions').querySelectorAll('.reactWrapper').forEach(
			emoji => emoji.style.background = 'none'
		);

		document.querySelectorAll('.moreReacts .reactWrapper').forEach(
			option => option.style.background = 'none'
		);

		const downloadable = {
			'image': true,
			'file': true,
			'audio': true,
		};

		//if the message is a text message
		if (type === 'text') {
			copyOption.style.display = 'flex';
			//console.log('Copy Option Shown');
		} else if (downloadable[type]) { //if the message is an image
			if (target.closest('.message')?.dataset.downloaded == 'true') {
				downloadOption.style.display = 'flex';
				//console.log('Download Option Shown');
			}
		}
		if (sender === true) { //if the message is sent by me
			deleteOption.style.display = 'flex'; //then show the delete option
			//console.log('Delete Option Shown');
		} else { //else dont show the delete option
			deleteOption.style.display = 'none';
			//console.log('Delete Option Hidden');
		}
		//get if the message has my reaction or not
		const clicked = Array.from(target.closest('.message').querySelectorAll('.reactedUsers .list')).reduce((acc, curr) => {
			return acc || curr.dataset.uid == myId;
		}, false);

		//2nd last element
		const elm = document.getElementById('reactOptions');
		const lastElm = elm.lastElementChild.previousElementSibling;

		if (clicked) { //if the message has my reaction
			//get how many reactions the message has
			const clickedElement = target.closest('.message')?.querySelector(`.reactedUsers [data-uid="${myId}"]`)?.textContent;

			if (reactArray.primary.includes(clickedElement)) { //if the message has my primary reaction
				//selected react color
				document.querySelector(`#reactOptions [data-react="${clickedElement}"]`).style.background = 'var(--secondary-dark)';
			}
			if (reactArray.expanded.includes(clickedElement)) {
				document.querySelector(`.moreReacts [data-react="${clickedElement}"]`).style.background = 'var(--secondary-dark)';
			}
			if (reactArray.expanded.includes(clickedElement) && !reactArray.primary.includes(clickedElement)) {
				lastElm.style.background = 'var(--secondary-dark)';
				lastElm.dataset.react = clickedElement;
				lastElm.querySelector('.react-emoji').textContent = clickedElement;
			}
		} else {
			//console.log('No self previous reaction. loading from last react');
			const last = localStorage.getItem('lastReact');
			if (!reactArray.primary.includes(last) && !reactArray.expanded.includes(last)) {
				//console.log('Setting default last react: 🌻');
				reactArray.last = '🌻';
				lastElm.dataset.react = '🌻';
				lastElm.querySelector('.react-emoji').textContent = '🌻';
				localStorage.setItem('lastReact', '🌻');
			} else if (!reactArray.primary.includes(last) && reactArray.expanded.includes(last)) {
				//console.log('Setting Last react:', last);
				lastElm.dataset.react = last;
				lastElm.querySelector('.react-emoji').textContent = last;
			}
		}
		//show the options
		playExpandSound();
		messageOptions.classList.add('active');
		addFocusGlass(false);
		messageOptions.addEventListener('click', optionsMainEvent);
	} catch (err) {
		console.error(err);
	}
}

/**
 * Adds a backdrop to the options
 * @param {boolean} backdrop Show the backdrop or not 
 */
function addFocusGlass(backdrop = true) {
	const focusGlass = document.getElementById('focus_glass');
	focusGlass.classList.remove('backdrop');
	focusGlass.classList.add('active');
	if (backdrop == true) {
		focusGlass.classList.add('backdrop');
	}
}

function removeFocusGlass() {
	const focusGlass = document.getElementById('focus_glass');
	focusGlass.classList.remove('active');
	focusGlass.classList.remove('backdrop');
}

/**
 * 
 * @param {Event} e 
 */
function optionsMainEvent(e) {

	const target = e.target;
	//replyOption.addEventListener('click', showReplyToast);
	if (target == replyOption) {
		showReplyToast();
	} else if (target == copyOption) {
		hideOptions();
		copyText(null);
	} else if (target == downloadOption) {
		downloadHandler();
	} else if (target == deleteOption) {
		const uid = document.getElementById(targetMessage.id)?.dataset?.uid;
		if (uid) {
			hideOptions();
			//console.log(document.getElementById(targetMessage.id));
			chatSocket.emit('deletemessage', targetMessage.id, uid, myName, myId);
		}
	} else {
		hideOptions();
	}

	//passes the event to the react event handler, Which handles the reactions if the target is a react
	optionsReactEvent(e);
}

/**
 * Deletes the message from the DOM and the source
 * @param {string} messageId 
 * @param {string} user 
 */
export function deleteMessage(messageId, user) {
	const message = document.getElementById(messageId);
	if (message) { //if the message exists
		const type = message.dataset.type;
		if (['image', 'file'].includes(type)) { //if the message is an image or file
			//console.log(`Deleting message id: ${messageId}`);
			//if any xhr is running, abort it
			if (ongoingXHR.has(messageId)) {
				//console.log('Aborted ongoing XHR');
				ongoingXHR.get(messageId).abort();
				ongoingXHR.delete(messageId);
			} else if (incommingXHR.has(messageId)) {
				//console.log('Aborted incomming XHR');
				incommingXHR.get(messageId).abort();
				incommingXHR.delete(messageId);
			}

			if (type == 'image') {
				//delete the image from the source
				URL.revokeObjectURL(message.querySelector('.image').src);
				//console.log(message.querySelector('.image').src, 'deleted');
			} else if (type == 'file') {
				//delete the file from the source
				URL.revokeObjectURL(message.querySelector('.msg').dataset.src);
				//console.log(message.querySelector('a').href, 'deleted');
			}
		}

		//if message is image or file
		message.querySelectorAll('[data-type="image"], [data-type="file"]')
			.forEach((elem) => {
				//delete element and also from the source
				URL.revokeObjectURL(elem.src);
				//console.log(elem.src, 'deleted');
				elem.remove();
			});

		const fragment = fragmentBuilder({
			tag: 'div',
			attr: {
				class: 'text msg',
			},
			text: 'Deleted message',
		});
		message.querySelector('.msg').replaceWith(fragment);
		message.classList.add('deleted');
		message.dataset.deleted = true;
		message.querySelector('.messageTitle').textContent = user;
		showPopupMessage(`${user == myName ? 'You' : user} deleted a message`);

		if (maxUser == 2 || (message.dataset.uid == myId)) {
			message.classList.add('notitle');
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
		const replyMessages = document.querySelectorAll(`[data-repid='${messageId}']`);
		if (replyMessages != null) {
			replyMessages.forEach(reply => {
				//console.log('%cMessage reply removed', 'color: red;');
				if (reply.classList.contains('imageReply')) {
					reply.classList.remove('imageReply');
					reply.querySelector('img').remove();
				}
				reply.removeAttribute('data-replyfor');
				reply.style.background = 'var(--glass)';
				reply.style.color = '#7d858c';
				reply.style.fontStyle = 'italic';
				reply.textContent = 'Deleted message';
			});
		}
		lastPageLength = messages.scrollTop;
	}
}
/**
 * Handles the download of the file
 */
function downloadHandler() {
	if (document.getElementById(targetMessage.id).dataset.downloaded != 'true') {
		//if sender is me
		if (targetMessage.sender == 'You') {
			showPopupMessage('Not uploaded yet');
		} else {
			showPopupMessage('Not downloaded yet');
		}
		return;
	}
	if (targetMessage.type === 'image') {
		lightboxImage.querySelector('img').src = targetMessage.message.src;
		hideOptions();
		saveImage();
	} else {
		hideOptions();
		downloadFile();
	}
}
/**
 * Saves the image to the device
 */
function saveImage() {
	try {
		//console.log('Saving image');
		showPopupMessage('Preparing image...');
		const a = document.createElement('a');
		a.href = lightboxImage.querySelector('img').src;
		a.download = `poketab-${Date.now()}`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	} catch (e) {
		console.log(e);
	}
}
/**
 * Downloads the file
 */
function downloadFile() {
	showPopupMessage('Preparing download...');

	const downloadName = {
		'file': `Poketab-${Date.now()}-${targetFile.fileName}`,
		'audio': `Poketab-${Date.now()}.${targetFile.ext == 'mpeg' ? 'mp3' : targetFile.ext}`,
	};

	const data = targetFile.fileData;

	//let filetype = filename.split('.').pop();
	const a = document.createElement('a');
	a.href = data;
	a.download = downloadName[targetMessage.type];
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}

/**
 * Handles the react event
 * This function is called when the user clicks on a react
 * @param {Event} e 
 */
function optionsReactEvent(e) {
	//console.log(e.type);
	//get the react
	const isReact = e.target?.classList.contains('reactWrapper');
	if (isReact) {
		const target = e.target.dataset.react;
		sendReact(target);
	} else if (e.target == showMoreReactBtn) {
		updateReactsChooser();
	}
}

/**
 * Reacts to the message
 * @param {string} react 
 */
function sendReact(react) {
	if (reactArray.primary.includes(react) || reactArray.expanded.includes(react)) {
		const messageId = targetMessage.id;
		localStorage.setItem('lastReact', react);
		if (Array.from(userInfoMap.keys()).length < 2) {
			getReact(react, messageId, myId);
		} else {
			chatSocket.emit('react', react, messageId, myId);
		}
		hideOptions();
	}
}

let hideOptionsTimeout = undefined;
function hideOptions() {
	const container = document.querySelector('.reactOptionsWrapper');
	container.dataset.expanded = 'false';
	moreReactsContainer.dataset.expanded = 'false';
	moreReactsContainer.classList.remove('active');
	moreReactsContainer.dataset.role = '';

	messageOptions.classList.remove('active');
	//console.log('Hiding options');
	hideSidePanel();
	hideThemes();
	//document.getElementById('focus_glass').classList.remove('active');
	removeFocusGlass();
	document.querySelector('.reactorContainerWrapper').classList.remove('active');

	messageOptions.removeEventListener('click', optionsMainEvent);

	if (hideOptionsTimeout) {
		clearTimeout(hideOptionsTimeout);
	}

	hideOptionsTimeout = setTimeout(() => {
		//console.log('Hiding options');
		copyOption.style.display = 'none';
		downloadOption.style.display = 'none';
		deleteOption.style.display = 'none';
		hideOptionsTimeout = undefined;
	}, 200);
}


let xStart = null;
let yStart = null;
let xDiff = 0;
let yDiff = 0;
let horizontalSwipe = false;
let touchEnded = true;

// Listen for a swipe on left
messages.addEventListener('touchstart', (evt) => {
	if (evt.target.closest('.message')) {
		xStart = (evt.touches[0].clientX / 3);
		yStart = (evt.touches[0].clientY / 3);
		//console.log('Swipe started');
	}
});

messages.addEventListener('touchmove', (evt) => {
	try {
		const msg = evt.target.closest('.message');

		if (evt.target.classList.contains('msg') || evt.target.closest('.msg') && msg.dataset.deleted != 'true') {
			//console.log(xDiff);

			xDiff = xStart - (evt.touches[0].clientX / 3);
			yDiff = yStart - (evt.touches[0].clientY / 3);

			//which direction is swipe was made first time
			if (horizontalSwipe == false) {
				if (Math.abs(xDiff) > Math.abs(yDiff) && touchEnded) {
					horizontalSwipe = true;
				} else {
					horizontalSwipe = false;
				}
			}
			touchEnded = false;
			//if horizontal
			if (horizontalSwipe) {
				//console.log('horizontal');
				const elem = msg.querySelector('.messageContainer');
				const replyIcon = msg.querySelector('.replyIcon');

				elem.dataset.swipestarted = 'true';

				//if msg is self
				if (msg.classList.contains('self') && msg.classList.contains('delevered') /*&& deg <= 20 && deg >= -20*/) {
					if (xDiff >= 50) {
						elem.dataset.replyTrigger = 'true';
						replyIcon.style.transform = `translateX(${xDiff}px)`;
					} else {
						elem.dataset.replyTrigger = 'false';
					}
					xDiff = xDiff < 0 ? 0 : xDiff;
					elem.style.transform = `translateX(${-xDiff}px)`;
				} else /*if(deg <= 160 && deg >= -160 && !msg.classList.contains('self'))*/ {
					if (xDiff <= -50) {
						elem.dataset.replyTrigger = 'true';
						replyIcon.style.transform = `translateX(${xDiff}px)`;
					} else {
						elem.dataset.replyTrigger = 'false';
					}
					xDiff = xDiff > 0 ? 0 : xDiff;
					elem.style.transform = `translateX(${-xDiff}px)`;
				}
			}
		}
		//console.log('Swipe moved');
	} catch (e) {
		console.log(e);
		showPopupMessage(e);
	}
});

// Listen for a swipe on right
messages.addEventListener('touchend', (evt) => {
	try {
		if (evt.target.closest('.message')) {

			touchEnded = true;

			//console.log('Swipe ended');
			const elem = evt.target.closest('.message').querySelector('.messageContainer');
			elem.dataset.swipestarted = 'false';


			//xDiff = 0;
			//yDiff = 0;

			horizontalSwipe = false;

			const msg = evt.target.closest('.message');
			if (!msg) {
				return;
			} else {
				const elem = msg.querySelector('.messageContainer');
				const replyIcon = msg.querySelector('.replyIcon');
				if (elem.closest('.message').classList.contains('self')) {
					replyIcon.style.transform = 'translateX(50px)';
				} else {
					replyIcon.style.transform = 'translateX(-50px)';
				}

				//add a smooth transition to the element
				elem.style.transition = 'transform 150ms ease-in-out';
				elem.style.transform = 'translateX(0px)';
				setTimeout(() => {
					elem.style.transition = 'none';
				}, 150);

				if (elem.dataset.replyTrigger === 'true') {
					elem.dataset.replyTrigger = 'false';
					//add data to finalTarget
					OptionEventHandler(evt, false);
					showReplyToast();
				}
			}
		}
	} catch (e) {
		console.log(e);
		showPopupMessage(e);
	}
});


function showReplyToast() {
	hideOptions();
	//updateScroll();
	textbox.focus();
	finalTarget = Object.assign({}, targetMessage);

	const exists = document.getElementById('replyToast');

	let replyToast;
	let content;
	let title;
	let username;
	let replyData;
	let close;

	if (exists) {
		replyToast = document.getElementById('replyToast');
		content = replyToast.querySelector('.content');
		title = replyToast.querySelector('.title');
		username = replyToast.querySelector('.username');
		replyData = replyToast.querySelector('.replyData');
		close = replyToast.querySelector('.close');
	} else {
		//create reply toast manually
		replyToast = document.createElement('div');
		replyToast.id = 'replyToast';
		replyToast.classList.add('replyToast');

		content = document.createElement('div');
		content.classList.add('content');

		title = document.createElement('div');
		title.classList.add('title');

		username = document.createElement('span');
		username.classList.add('username');

		replyData = document.createElement('div');
		replyData.classList.add('replyData');

		close = document.createElement('div');
		close.classList.add('close', 'fa-solid', 'fa-xmark');
	}

	//add data to reply toast
	if (finalTarget.type == 'image' || finalTarget.type == 'sticker') {

		document.querySelector('.newmessagepopup').classList.remove('toastActiveFile');
		document.querySelector('.newmessagepopup').classList.add('toastActiveImage');
		if (finalTarget.message.src !== replyData.firstChild?.src) {
			while (replyData.firstChild) {
				replyData.removeChild(replyData.firstChild);
			}
			replyData.appendChild(finalTarget.message);
		}
	} else if (finalTarget.type == 'file' || finalTarget.type == 'audio') {
		document.querySelector('.newmessagepopup').classList.remove('toastActiveImage');
		document.querySelector('.newmessagepopup').classList.add('toastActiveFile');
		while (replyData.firstChild) {
			replyData.removeChild(replyData.firstChild);
		}
		const fileIcon = document.createElement('i');
		const iconSet = {
			'file': 'fa-paperclip',
			'audio': 'fa-music',
		};
		fileIcon.classList.add('fa-solid', iconSet[finalTarget.type]);
		replyData.appendChild(fileIcon);
		replyData.appendChild(document.createTextNode(finalTarget.message?.substring(0, 50)));
	} else {
		document.querySelector('.newmessagepopup').classList.remove('toastActiveImage');
		document.querySelector('.newmessagepopup').classList.remove('toastActiveFile');
		document.querySelector('.newmessagepopup').classList.add('toastActive');
		replyData.textContent = finalTarget.message?.length > 30 ? finalTarget.message.substring(0, 27) + '...' : finalTarget.message;
	}

	username.textContent = finalTarget.sender;

	if (!document.getElementById('replyToast')) {
		title.appendChild(document.createTextNode(' Replying to '));
		title.appendChild(username);

		content.appendChild(title);
		content.appendChild(replyData);

		replyToast.appendChild(content);
		replyToast.appendChild(close);
		document.querySelector('.footer').insertAdjacentElement('beforebegin', replyToast);
	}


	setTimeout(() => {
		replyToast.classList.add('active');
		updateScroll();
	}, 100);


	replyToast.querySelector('.close').onclick = () => {
		clearTargetMessage();
		clearFinalTarget();
		hideReplyToast();
	};
}

function hideReplyToast() {
	const replyToast = document.getElementById('replyToast');
	if (replyToast) {
		replyToast.classList.remove('active');
		document.querySelector('.newmessagepopup').classList.remove('toastActive');
		document.querySelector('.newmessagepopup').classList.remove('toastActiveImage');
		document.querySelector('.newmessagepopup').classList.remove('toastActiveFile');
		clearTargetMessage();
		setTimeout(() => {
			updateScroll();
			replyToast.remove();
		}, 100);
	}
}

/**
 * 
 * @param {HTMLElement} target 
 * @param {string} uid 
 * @param {string} reactEmoji 
 */
function appendReactToMessage(target, uid, reactEmoji) {
	playReactSound();
	const div = document.createElement('div');
	div.classList.add('list');
	div.dataset.uid = uid;
	div.textContent = reactEmoji;
	target.append(div);
}

/**
 * 
* @param {string} reactEmoji Emoji to react with
 * @param {string} messageId Id of the message
 * @param {string} uid Id of the user who reacted
 */
export function getReact(reactEmoji, messageId, uid) {
	try {
		const targetMessage = document.getElementById(messageId);
		const target = targetMessage.querySelector('.reactedUsers');
		const exists = target.querySelector('.list') ? true : false;
		if (exists) {
			const list = target.querySelector('.list[data-uid="' + uid + '"]');
			if (list) {
				if (list.textContent == reactEmoji) {
					list.remove();
				} else {
					list.textContent = reactEmoji;
				}
			} else {
				appendReactToMessage(target, uid, reactEmoji);
			}
		}
		else {
			appendReactToMessage(target, uid, reactEmoji);
		}

		const list = Array.from(target.querySelectorAll('.list'));

		//main react container
		const reactsOfMessage = targetMessage.querySelector('.reactsOfMessage');

		//reacts container
		const reactsContainer = reactsOfMessage.querySelector('.reactsContainer');

		//if other react has the uid
		const currentReact = reactsContainer.querySelector(`.react[data-emoji="${reactEmoji}"]`);
		if (currentReact) {
			//console.log('Same react found: ', currentReact);
			//if the sender is same, then remove uid
			if (currentReact.dataset.uids.includes(uid)) {
				currentReact.dataset.uids = currentReact.dataset.uids.replace(`${uid};`, '');
				//console.log('uid removed from : ', currentReact.dataset.emoji);
				if (currentReact.dataset.uids == '') {
					currentReact.remove();
				}
			} else {
				//if user has other reacts on the same target
				const previousReact = reactsContainer.querySelector(`.react[data-uids*="${uid}"]`);
				if (previousReact) {
					//remove uid
					previousReact.dataset.uids = previousReact.dataset.uids.replace(`${uid};`, '');
					//console.log('uid removed from previous : ', previousReact.dataset.emoji);
					if (previousReact.dataset.uids == '') {
						previousReact.remove();
					}
				}

				//move the react to the last
				reactsContainer.appendChild(currentReact); //This react is moved to the last, because it is the latest react

				//add uid to the current react
				currentReact.dataset.uids += `${uid};`;
				//reset the animation
				const animation = currentReact.querySelector('.react-popup');
				animation.classList.remove('active');
				setTimeout(() => {
					animation.classList.add('active');
					setTimeout(() => {
						animation.classList.remove('active');
					}, 1000);
				}, 60);

			}
		} else {

			//if user has other reacts on the same target
			const previousReact = reactsContainer.querySelector(`.react[data-uids*="${uid}"]`);
			if (previousReact) {
				//remove uid
				previousReact.dataset.uids = previousReact.dataset.uids.replace(`${uid};`, '');
				//console.log('uid removed from previous : ', previousReact.dataset.emoji);
				if (previousReact.dataset.uids == '') {
					previousReact.remove();
				}
			}

			//react does not exists, so make it.
			//console.log('Creating new react : ', reactEmoji);

			const fragment = fragmentBuilder({
				tag: 'span',
				attr: {
					class: 'react',
					'data-uids': `${uid};`,
					'data-emoji': reactEmoji
				},
				childs: [
					{
						tag: 'span',
						text: reactEmoji,
						attr: {
							class: 'emoji',
						}
					},
					{
						tag: 'span',
						text: reactEmoji,
						attr: {
							class: 'react-popup active',
						}
					}
				]
			});

			reactsContainer.appendChild(fragment);
		}

		const reactsCount = reactsOfMessage.querySelector('.reactsCount');

		reactsCount.textContent = list.length;

		if (list.length > 0) {
			targetMessage.classList.add('react');
			//console.log('Reacted');
		} else {
			targetMessage.classList.remove('react');
			//console.log('No react');
		}

		if (list.length > 1) {
			reactsOfMessage.classList.add('pad');
		} else {
			reactsOfMessage.classList.remove('pad');
		}

		checkgaps(messageId);

		updateScroll();
	} catch (e) {
		console.log(e);
	}
}

/**
 * Check if there is a gap between two messages, if there is a gap, add border radius to the message
 * @param {string} targetId Id of the message
 * @returns 
 */
export function checkgaps(targetId) {
	try {
		if (targetId) {

			const target = document.getElementById(targetId);

			if (target == null) {
				return;
			}

			const after = target.nextElementSibling;

			if (after == null) {
				return;
			}

			if (target.dataset.uid === after.dataset.uid) {

				const gap = Math.abs(target.querySelector('.messageContainer').getBoundingClientRect().bottom - after.querySelector('.messageContainer').getBoundingClientRect().top);

				if (target.dataset.uid == myId) {
					if (gap > 5) {
						target.querySelector('.messageMain .msg').style.borderBottomRightRadius = '18px';
						after.querySelector('.messageMain .msg').style.borderTopRightRadius = '18px';
					} else {
						if (!target.classList.contains('end') && !after.classList.contains('start')) {
							target.querySelector('.messageMain .msg').style.borderBottomRightRadius = '5px';
							after.querySelector('.messageMain .msg').style.borderTopRightRadius = '5px';
						}
					}
				} else {
					if (gap > 5) {
						target.querySelector('.messageMain .msg').style.borderBottomLeftRadius = '18px';
						after.querySelector('.messageMain .msg').style.borderTopLeftRadius = '18px';
					} else {
						if (!target.classList.contains('end') && !after.classList.contains('start')) {
							target.querySelector('.messageMain .msg').style.borderBottomLeftRadius = '5px';
							after.querySelector('.messageMain .msg').style.borderTopLeftRadius = '5px';
						}
					}
				}
			}
		}
	} catch (e) { console.log(e); }
}

//* util functions
function clearTargetMessage() {
	targetMessage.sender = '';
	targetMessage.message = '';
	targetMessage.type = '';
	targetMessage.id = '';
}

function clearFinalTarget() {
	finalTarget.sender = '';
	finalTarget.message = '';
	finalTarget.type = '';
	finalTarget.id = '';
}

/**
 * Gets fired when user clicks on a message. It prepares the config for the option menu.
 * @param {Event} evt 
 * @param {boolean} popup 
 * @returns 
 */
function OptionEventHandler(evt, popup = true) {
	evt.stopPropagation();
	evt.preventDefault();

	const typeList = {
		'text': true,
		'image': true,
		'file': true,
		'sticker': true,
		'audio': true,
		'video': false,
		'contact': false,
	};

	//console.log(evt.target);

	try {
		const message = evt.target.closest('.message');
		if (message == null) {
			return;
		}

		const type = message.dataset.type;

		if (!typeList[type] || !evt.target.closest('.msg')) {
			return;
		}

		const sender = evt.target.closest('.message').classList.contains('self') ? true : false;
		if (type == 'text') {
			//text
			targetMessage.sender = userInfoMap.get(evt.target.closest('.message')?.dataset?.uid).username;
			if (targetMessage.sender == myName) {
				targetMessage.sender = 'You';
			}
			targetMessage.message = evt.target.closest('.messageMain').querySelector('.text').textContent;
			targetMessage.type = type;
			targetMessage.id = evt.target.closest('.message').id;
		}
		else if (type == 'image') {
			//image
			while (lightboxImage.firstChild) {
				lightboxImage.removeChild(lightboxImage.firstChild);
			}

			const imageFragment = fragmentBuilder({
				tag: 'img',
				attributes: {
					src: evt.target.closest('.messageMain')?.querySelector('.image').src,
					alt: 'Image',
				},
			});

			lightboxImage.append(imageFragment);
			targetMessage.sender = userInfoMap.get(evt.target.closest('.message')?.dataset?.uid).username;
			if (targetMessage.sender == myName) {
				targetMessage.sender = 'You';
			}

			const targetNode = evt.target.closest('.messageMain').querySelector('.image').cloneNode(true);
			//remove all attributes
			targetNode.removeAttribute('alt');
			targetNode.removeAttribute('id');
			targetNode.setAttribute('class', 'image');
			targetMessage.message = targetNode;
			targetMessage.type = type;
			targetMessage.id = evt.target.closest('.message').id;
		} else if (type == 'audio') {
			// audio
			targetMessage.sender = userInfoMap.get(evt.target.closest('.message')?.dataset?.uid).username;
			if (targetMessage.sender == myName) {
				targetMessage.sender = 'You';
			}
			targetFile.fileName = targetMessage.message = 'Audio message';
			targetFile.fileData = evt.target.closest('.messageMain').querySelector('.msg').dataset.src;
			targetFile.ext = evt.target.closest('.messageMain').querySelector('.msg').dataset.ext;
			targetMessage.type = type;
			targetMessage.id = evt.target.closest('.message').id;
		} else if (type == 'file') {
			//file
			targetMessage.sender = userInfoMap.get(evt.target.closest('.message')?.dataset?.uid).username;
			if (targetMessage.sender == myName) {
				targetMessage.sender = 'You';
			}
			targetFile.fileName = evt.target.closest('.messageMain').querySelector('.fileName').textContent;
			targetFile.fileData = evt.target.closest('.messageMain').querySelector('.msg').dataset.src;
			targetFile.ext = evt.target.closest('.messageMain').querySelector('.msg').dataset.ext;
			targetMessage.message = targetFile.fileName;
			targetMessage.type = type;
			targetMessage.id = evt.target.closest('.message').id;
		} else if (type == 'sticker') {
			//sticker
			targetMessage.sender = userInfoMap.get(evt.target.closest('.message')?.dataset?.uid).username;
			if (targetMessage.sender == myName) {
				targetMessage.sender = 'You';
			}
			const targetNode = evt.target.closest('.messageMain').querySelector('.sticker').cloneNode(true);
			//remove all attributes
			targetNode.removeAttribute('alt');
			targetNode.removeAttribute('id');
			targetNode.setAttribute('class', 'image');
			targetMessage.message = targetNode;
			targetMessage.type = type;
			targetMessage.id = evt.target.closest('.message').id;
		}
		if ((typeList[type]) && popup) {
			showOptions(type, sender, evt.target);
		}
		vibrate();
	} catch (e) {
		console.log(e);
	}
}

/**
 * 
 * @param {string} avatar 
 * @param {string} text 
 * @returns 
 */
export function updateScroll(uid = null, text = '') {
	//console.log(uid, text, scrolling);
	if (scrolling && uid != myId) {
		if (text.length > 0 && uid != null) {
			const avatar = userInfoMap.get(uid)?.avatar;
			document.querySelector('.newmessagepopup img').style.display = 'block';
			document.querySelector('.newmessagepopup .msg').style.display = 'inline-block';
			document.querySelector('.newmessagepopup .downarrow').style.display = 'none';
			document.querySelector('.newmessagepopup img').src = `/images/avatars/${avatar}(custom).webp`;
			document.querySelector('.newmessagepopup img').classList.add('newmessagepopupavatar');
			document.querySelector('.newmessagepopup .msg').textContent = text;
			document.querySelector('.newmessagepopup').classList.add('active');
		}
		return;
	}else{
		//scroll to bottom
		messages.scrollTop = messages.scrollHeight;
	}

}


function removeNewMessagePopup() {
	document.querySelector('.newmessagepopup').classList.remove('active');
	document.querySelector('.newmessagepopup img').style.display = 'none';
	document.querySelector('.newmessagepopup .downarrow').style.display = 'none';
}


let typingStatusTimeout = undefined;
/**
 * Emits typing status of the current user to everyone
 */
function typingStatus() {
	if (typingStatusTimeout) {
		clearTimeout(typingStatusTimeout);
		typingStatusTimeout = undefined;
	}
	if (!isTyping) {
		isTyping = true;
		chatSocket.emit('typing');
	}
	typingStatusTimeout = setTimeout(function () {
		isTyping = false;
		chatSocket.emit('stoptyping');
		typingStatusTimeout = undefined;
	}, 1000);
}

/**
 * 
 * @param {HTMLImageElement} img Image to resize
 * @param {string} mimetype Mimetype of the image
 * @param {number} q Quality of the image
 * @returns Object{data: string, width: number, height: number}
 */
function resizeImage(img, mimetype, q = 1080) {
	//create a canvas object to resize the image
	const canvas = document.createElement('canvas');
	let width = img.width;
	let height = img.height;
	const max_height = q;
	const max_width = q;
	// calculate the width and height, constraining the proportions
	if (width > height) {
		if (width > max_width) {
			height = Math.round(height *= max_width / width);
			width = max_width;
		}
	} else {
		if (height > max_height) {
			width = Math.round(width *= max_height / height);
			height = max_height;
		}
	}
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0, width, height);
	return { data: canvas.toDataURL(mimetype, 1), height: height, width: width };
}


/**
 * Copies text to clipboard
 * @param {string} text 
 * @returns 
 */
function copyText(text) {
	//return if the text is empty
	if (text == null) {
		text = targetMessage.message;
	}
	//return if the device doesn't support clipboard access
	if (!navigator.clipboard) {
		showPopupMessage('This browser doesn\'t support clipboard access');
		return;
	}
	//copy the text to clipboard and show a popup
	navigator.clipboard.writeText(text);
	showPopupMessage('Copied to clipboard');
}


let popupTimeout = undefined;
/**
 * Shows a popup message for 1 second
 * @param {string} text Text to show in the popup
 */
export function showPopupMessage(text) {

	let popup = document.querySelector('.popup-message');
	if (!popup) {
		popup = document.createElement('div');
		popup.classList.add('popup-message');
		document.body.appendChild(popup);
	}
	popup.textContent = text;
	popup.classList.add('active');
	if (popupTimeout) {
		clearTimeout(popupTimeout);
	}
	popupTimeout = setTimeout(function () {
		popup.classList.remove('active');
		setTimeout(() => {
			popup.remove();
		}, 150);
		popupTimeout = undefined;
	}, 1000);
}

/**
 * Message from the server
 * @param {string} message 
 * @param {string} type Message type [Join, leave, location]
 */
export function serverMessage(message, type = null, color = null) {
	//create a new message element manually and append it to the messages list

	let messageObj;

	if (type == 'location') {
		locationTimeout ? clearTimeout(locationTimeout) : null;
		messageObj = {
			tag: 'a',
			attr: {
				href: `https://www.google.com/maps?q=${message.coordinate.latitude},${message.coordinate.longitude}`,
				target: '_blank',
				class: 'locationLink'
			},
			child: {
				tag: 'i',
				attr: {
					class: 'fa-solid fa-location-dot fa-flip',
					style: 'padding: 18px 5px; --fa-animation-duration: 2s; font-size: 2rem;'
				}
			},

			text: `${message.user}'s location`,
		};

		updateScroll('location', `${message.user}'s location`);
	} else if (type == 'leave') {
		messageObj = {
			text: message.text
		};
		userTypingMap.delete(message.who);
		document.querySelectorAll(`.msg-item[data-seen*="${message.who}"]`)
			.forEach(elem => {
				elem.querySelector(`.seenBy img[data-user="${message.who}"]`)?.remove();
			});
		setTypingUsers();
	} else {
		messageObj = {
			text: message.text
		};
	}

	const serverMessage = fragmentBuilder(
		{
			tag: 'li',
			attr: {
				class: 'serverMessage msg-item',
				id: message.id
			},
			childs: [
				{
					tag: 'div',
					attr: {
						class: 'messageContainer',
						style: `color: ${color || message.color}`,
					},
					child: {
						...messageObj
					}
				},
				{
					tag: 'div',
					attr: {
						class: 'seenBy'
					},
				},
			]
		}
	);

	messages.appendChild(serverMessage);

	lastSeenMessage = message.id;
	if (document.hasFocus()) {
		chatSocket.emit('seen', ({ userId: myId, messageId: lastSeenMessage, avatar: myAvatar }));
	}
	updateScroll();
}

/**
 * Vibrate the device for 50ms
 */
function vibrate() {
	if (navigator.vibrate) {
		navigator.vibrate(50);
	}
}

/**
 * Shows the theme picker
 */
function showThemes() {

	if (!themePicker.classList.contains('active')) {
		hideOptions();
		//console.log('showing themes');
		activeModals.push('themes');
		//console.log(activeModals);
		modalCloseMap.set('themes', hideThemes);
		if (THEME) {
			if (themeArray.includes(THEME) == false) {
				THEME = 'ocean';
				localStorage.setItem('theme', THEME);
			}
			themePicker.querySelectorAll('.theme').forEach(theme => {
				theme.querySelector('img').style.outline = '';
			});
			document.querySelector(`.themePicker #${THEME}`).querySelector('img').style.outline = '2px solid var(--secondary-dark)';
		}
		//addFocusGlass();
		themePicker.classList.add('active');
	}
}

/**
 * Hides the theme picker
 */
function hideThemes() {
	//console.log('hiding themes', activeModals);
	if (activeModals.includes('themes')) {
		themePicker.classList.remove('active');
		//removeFocusGlass();
		activeModals.splice(activeModals.indexOf('themes'), 1);
		modalCloseMap.delete('themes');
	}
}

/**
 * Shows sidebar panel
 */
function showSidePanel() {
	if (!activeModals.includes('sidePanel')) {
		//console.log('showing side panel');
		sideBarPanel.classList.add('active');
		activeModals.push('sidePanel');
		modalCloseMap.set('sidePanel', hideSidePanel);
	}
}

document.querySelector('.footer_options .settings').addEventListener('click', () => {
	showQuickSettings();
	hideOptions();
});

/**
 * Shows the quick settings panel
 */
function showQuickSettings() {
	//show setting panel
	if (!quickSettings.classList.contains('active')) {
		//console.log('showing quick settings');
		activeModals.push('quickSettings');
		modalCloseMap.set('quickSettings', hideQuickSettings);
		chooseQuickEmojiButton.querySelector('.quickEmojiIcon').textContent = quickReactEmoji;
		quickSettings.classList.add('active');
	}
}
/**
 * Hides the quick settings panel
 */
function hideQuickSettings() {
	if (activeModals.includes('quickSettings')) {
		quickSettings.classList.remove('active');
		activeModals.splice(activeModals.indexOf('quickSettings'), 1);
		modalCloseMap.delete('quickSettings');
	}
}

quickSettings.addEventListener('click', (e) => {
	//if click on quickSettings, then hide quickSettings
	if (e.target == quickSettings) {
		if (activeModals.includes('quickSettings')) {
			hideQuickSettings();
			activeModals.splice(activeModals.indexOf('quickSettings'), 1);
		}
	}
});


document.querySelector('.quickSettingPanel').addEventListener('click', (evt) => {
	const option = evt.target?.closest('.keyboardMode');
	if (!option) {
		return;
	}

	const value = option.querySelector('input').value;

	//value can be 'Enter' or 'Ctrl+Enter'
	//if clicked on the same option, then deselect it and set sendBy to 'Enter' if it was 'Ctrl+Enter' or 'Ctrl+Enter' if it was 'Enter'
	if (messageSendShortCut == value) {
		messageSendShortCut = messageSendShortCut == 'Enter' ? 'Ctrl+Enter' : 'Enter';
	} else {
		messageSendShortCut = value;
	}

	loadSendShortcut();
	//hideQuickSettings();
	localStorage.setItem('sendBy', messageSendShortCut);
	showPopupMessage('Settings applied');
});

document.addEventListener('click', (evt) => {
	//if target is .clickable
	if (evt.target.closest('.playable')) {
		playClickSound();
	}
});

document.getElementById('messageSound').addEventListener('click', () => {
	if (document.getElementById('messageSound').checked) {
		messageSoundEnabled = true;
	} else {
		messageSoundEnabled = false;
		document.getElementById('messageSound').removeAttribute('checked');
	}
	//hideQuickSettings();
	localStorage.setItem('messageSoundEnabled', messageSoundEnabled);
	showPopupMessage('Message sounds ' + (messageSoundEnabled ? 'enabled' : 'disabled'));
});

document.getElementById('buttonSound').addEventListener('click', () => {
	if (document.getElementById('buttonSound').checked) {
		buttonSoundEnabled = true;
	} else {
		buttonSoundEnabled = false;
		document.getElementById('buttonSound').removeAttribute('checked');
	}
	//hideQuickSettings();
	localStorage.setItem('buttonSoundEnabled', buttonSoundEnabled);
	showPopupMessage('Button sounds ' + (buttonSoundEnabled ? 'enabled' : 'disabled'));
});


/**
 * Show attachment picker panel
 */
function addAttachment() {

	if (!activeModals.includes('attachments')) {
		//console.log('showing attachment');
		activeModals.push('attachments');
		modalCloseMap.set('attachments', removeAttachment);
		attachmentCloseArea.classList.add('active');
	}
}

/**
 * Hide attachment picker panel
 */
function removeAttachment() {
	if (activeModals.includes('attachments')) {
		attachmentCloseArea.classList.remove('active');
		//console.log('removing attachment');
		activeModals.splice(activeModals.indexOf('attachments'), 1);
		modalCloseMap.delete('attachments');
		//console.log(activeModals);
	}
}

document.getElementById('stickerBtn').addEventListener('click', () => {
	softKeyboardActive = false;
	textbox.blur();
	showStickersPanel();
});

document.getElementById('stickersKeyboard').addEventListener('click', e => {

	if (e.target.tagName === 'IMG' && e.target.classList.contains('sendable')) {
		const tempId = crypto.randomUUID();
		playStickerSound();
		scrolling = false;

		insertNewMessage(e.target.dataset.name, 'sticker', tempId, myId, { data: finalTarget?.message, type: finalTarget?.type }, finalTarget?.id, { reply: (finalTarget?.message ? true : false), title: (finalTarget?.message || maxUser > 2 ? true : false) }, {});

		if (Array.from(userInfoMap.keys()).length < 2) {
			//console.log('Server replay skipped');
			const msg = document.getElementById(tempId);
			msg?.classList.add('delevered');
			//playOutgoingSound();
		} else {
			chatSocket.emit('message', e.target.dataset.name, 'sticker', myId, { data: finalTarget?.message, type: finalTarget?.type }, finalTarget?.id, { reply: (finalTarget?.message ? true : false), title: (finalTarget?.message || maxUser > 2 ? true : false) }, function (id, error) {
				playOutgoingSound();

				if (error) {
					console.log(error);
					document.getElementById(tempId).dataset.type = 'error';
					document.getElementById(tempId).querySelector('.messageMain').innerHTML = `<div class="msg text" style="background: red">${error}</div>`;
					return;
				}

				document.getElementById(tempId).classList.add('delevered');
				document.getElementById(tempId).id = id;
				lastSeenMessage = id;
				if (document.hasFocus()) {
					chatSocket.emit('seen', ({ userId: myId, messageId: lastSeenMessage, avatar: myAvatar }));
				}
			});
		}

		clearTargetMessage();
		clearFinalTarget();
		hideReplyToast();
		hideStickersPanel();
	}
});

stickersPanel.addEventListener('click', (evt) => {
	//console.log(evt.target.id == 'stickersKeyboard');
	if (evt.target == stickersPanel) {
		//console.log('clicked on stickers panel');
		if (activeModals.includes('stickersPanel')) {
			hideStickersPanel();
		}
	}
});

function hideStickersPanel() {
	stickersPanel.classList.remove('active');
	activeModals.splice(activeModals.indexOf('stickersPanel'), 1);
	modalCloseMap.delete('stickersPanel');
	setStickerKeyboardState(false);
}

function showStickersPanel() {
	activeModals.push('stickersPanel');
	stickersPanel.classList.add('active');
	setStickerKeyboardState(true);
	const selectedSticker = localStorage.getItem('selectedSticker') || 'catteftel';
	if (selectedSticker) {
		//console.log(selectedSticker);
		const head = document.querySelector(`.stickersHeader img.${selectedSticker}`);
		if (!head) return;
		head.dataset.selected = 'true';
		head.scrollIntoView();
		const stickerBoard = document.querySelector(`.stickerBoard.${selectedSticker}`);
		stickerBoard.scrollIntoView();
	}
	modalCloseMap.set('stickersPanel', hideStickersPanel);
}

document.getElementById('more').addEventListener('click', () => {
	showSidePanel();
});


let copyKeyTimeOut;
const keyname = document.getElementById('keyname');
keyname.addEventListener('click', () => {
	keyname.querySelector('.fa-clone');
	keyname.classList.replace('fa-clone', 'fa-check');
	keyname.classList.replace('fa-regular', 'fa-solid');
	keyname.style.color = 'var(--secondary-dark)';
	if (copyKeyTimeOut) { clearTimeout(copyKeyTimeOut); }
	copyKeyTimeOut = setTimeout(() => {
		keyname.classList.replace('fa-check', 'fa-clone');
		keyname.classList.replace('fa-solid', 'fa-regular');
		keyname.style.color = 'var(--secondary-dark)';
		copyKeyTimeOut = undefined;
	}, 1000);
	copyText(myKey);
});

document.getElementById('invite').addEventListener('click', async () => {
	//copy inner link
	try {
		if (!navigator.share) {
			showPopupMessage('Sharing in not supported by this browser');
			return;
		}
		await navigator.share({
			title: 'Poketab Messenger',
			text: 'Join chat!',
			url: `${location.origin}/join/${myKey}`,
		});
		showPopupMessage('Shared!');
	} catch (err) {
		showPopupMessage(`${err}`);
	}
});

document.getElementById('themeButton').addEventListener('click', () => {
	//hideQuickSettings();
	showThemes();
});

//remove the theme optons from the screen when clicked outside
themePicker.addEventListener('click', () => {
	hideThemes();
});

document.querySelectorAll('.theme').forEach(theme => {
	theme.addEventListener('click', (evt) => {
		THEME = evt.target.closest('li').id;
		localStorage.setItem('theme', THEME);
		showPopupMessage('Theme applied');
		if (quickReactsEnabled == 'true'){
			quickReactEmoji = themeAccent[THEME].quickEmoji;
			localStorage.setItem('quickEmoji', quickReactEmoji);
			sendButton.dataset.role = 'quickEmoji';
		}
		chooseQuickEmojiButton.querySelector('.quickEmojiIcon').textContent = quickReactEmoji;
		//edit css variables
		document.documentElement.style.setProperty('--pattern', `url('../images/backgrounds/${THEME}_w.webp')`);
		document.documentElement.style.setProperty('--secondary-dark', themeAccent[THEME].secondary);
		document.documentElement.style.setProperty('--msg-get', themeAccent[THEME].msg_get);
		document.documentElement.style.setProperty('--msg-get-reply', themeAccent[THEME].msg_get_reply);
		document.documentElement.style.setProperty('--msg-send', themeAccent[THEME].msg_send);
		document.documentElement.style.setProperty('--msg-send-reply', themeAccent[THEME].msg_send_reply);
		themePicker.classList.remove('active');
		document.querySelector('meta[name="theme-color"]').setAttribute('content', themeAccent[THEME].secondary);
		hideOptions();
	});
});

//Opens more reacts when called
function updateReactsChooser() {
	const container = document.querySelector('.reactOptionsWrapper');
	const isExpanded = container.dataset.expanded == 'true';
	if (isExpanded) {
		container.dataset.expanded = 'false';
		moreReactsContainer.classList.remove('active');
		moreReactsContainer.dataset.role = '';
	} else {
		container.dataset.expanded = 'true';
		moreReactsContainer.classList.add('active');
	}
}

document.querySelector('.moreReacts').addEventListener('click', (evt) => {
	evt.preventDefault();
	const target = evt.target;
	//console.log('sending react ' + target.dataset.react);

	if(moreReactsContainer.dataset.role == 'quickEmoji'){
		quickReactEmoji = target.dataset.react;
		localStorage.setItem('quickEmoji', quickReactEmoji);
		if (sendButton.dataset.role == 'quickEmoji') {
			chooseQuickEmojiButton.querySelector('.quickEmojiIcon').textContent = quickReactEmoji;
			sendButton.dataset.role = 'quickEmoji';
		}
		hideOptions();
		return;
	}

	//if target is not self
	if (target.classList.contains('reactWrapper')) {
		const react = target.dataset.react;
		sendReact(react);
		hideOptions();
	}
});

messages.addEventListener('scroll', () => {
	scroll = messages.scrollTop;
	const scrolled = lastPageLength - scroll;
	if (scroll <= lastPageLength) {
		if (scrolled >= 50) {
			scrolling = true;
		}
		if (scrolled <= 50 && scrolled >= 0) {
			document.querySelector('.newmessagepopup').classList.remove('active');
			scrolling = false;
		}
	}
	else {
		lastPageLength = scroll;
		removeNewMessagePopup();
		scrolling = false;
	}
	//console.log(`scroll: ${scroll}, lastPageLength: ${lastPageLength}, scrolled: ${scrolled}`);
	if (scrolled >= 300) {
		document.querySelector('.newmessagepopup img').style.display = 'none';
		document.querySelector('.newmessagepopup .msg').style.display = 'none';
		document.querySelector('.newmessagepopup .downarrow').style.display = 'block';
		document.querySelector('.newmessagepopup').classList.add('active');
	}
});


document.querySelector('.newmessagepopup').addEventListener('click', () => {
	scrolling = false;
	//removeNewMessagePopup();
	updateScroll();
});

document.getElementById('logoutButton').addEventListener('click', () => {
	//show logout screen

	const preload = fragmentBuilder({
		tag: 'div',
		attr: {
			id: 'preload',
			class: 'preload',
		},
		childs: [
			{
				tag: 'div',
				text: 'Logging out',
				attr: {
					class: 'text',
				},
			},
			{
				tag: 'div',
				attr: {
					class: 'logo',
				},
				childs: [
					{
						tag: 'img',
						attr: {
							src: '/images/pokeball.png',
							alt: 'Poketab logo',
						},
					},
					{
						tag: 'div',
						attr: {
							class: 'ripple',
						},
					}
				]
			}
		]
	});

	//clear body
	while (document.body.firstChild) {
		document.body.removeChild(document.body.firstChild);
	}

	document.body.appendChild(preload);

	window.location.href = '/';
});

document.addEventListener('contextmenu', event => event.preventDefault());


lightboxCloseButton.addEventListener('click', () => {
	lightbox.classList.remove('active');
	while (lightboxImage.firstChild) {
		lightboxImage.removeChild(lightboxImage.firstChild);
	}
});

textbox.addEventListener('keydown', (evt) => {
	if (evt.key == 'Backspace') {
		if (textbox.innerHTML.trim() == '<br>') {
			textbox.innerText = '';
		}
	} else if (evt.key == 'Enter') {
		updateScroll();
	}
	typingStatus();
});


textbox.addEventListener('input', () => {
	const clone = textbox.cloneNode(true);
	clone.style.height = 'min-content';
	clone.style.position = 'absolute';
	clone.style.top = '-9999px';
	document.body.appendChild(clone);

	// Set the new height based on the content
	textbox.style.height = `${clone.scrollHeight}px`;

	document.body.removeChild(clone);
});

new MutationObserver(() => {
	//console.log('changed');
	//if the textbox is empty, then hide the send button

	if(quickReactsEnabled == 'false'){
		return;
	}

	if (textbox.textContent == '' && sendButton.dataset.role != 'quickEmoji') {
		sendButton.dataset.role = 'quickEmoji';
		//console.log('changed to quickEmoji');
	} else{
		sendButton.dataset.role = 'send';
	}
}).observe(textbox, { childList: true, subtree: true });


new MutationObserver(() => {
	//console.log('changed');
	if (sendButton.dataset.role == 'send'){
		sendButton.innerHTML = '<i class="fa-solid fa-paper-plane sendIcon"></i>';
	}else{
		sendButton.innerHTML = `<span class="quickEmoji">${quickReactEmoji}</span>`;
	}
}).observe(sendButton, { attributes: true, attributeFilter: ['data-role'] });


/**
 * Closes the side panel
 */
function hideSidePanel() {
	if (sideBarPanel.classList.contains('active')) {
		sideBarPanel.classList.remove('active');
		activeModals.splice(activeModals.indexOf('sidePanel'), 1);
		modalCloseMap.delete('sidePanel');
	}
}

document.getElementById('closeSideBar').addEventListener('click', () => {
	hideSidePanel();
});

attachmentCloseArea.addEventListener('click', () => {
	removeAttachment();
});

document.getElementById('attachment').addEventListener('click', () => {
	addAttachment();
});

/**
 * Primary react menu
 */
document.querySelector('.reactOptionsWrapper').addEventListener('click', (evt) => {
	//stop parent event
	if (evt.target.classList.contains('reactOptionsWrapper')) {
		hideOptions();
	}
});

let backToNormalTimeout = undefined;
let scrollIntoViewTimeout = undefined;

messages.addEventListener('click', (evt) => {
	try {
		//if the target is a message
		if (evt.target?.closest('.message')?.contains(evt.target) && !evt.target?.classList.contains('message')) {
			//get the message sent time and show it
			const messageTime = evt.target.closest('.message').querySelector('.messageTime');
			messageTime.textContent = getFormattedDate(messageTime.dataset.timestamp);
			messageTime.classList?.add('active');

			//if target is a pre or code
			if (evt.target.tagName == 'PRE' || evt.target.tagName == 'CODE') {
				//copy textContent
				navigator.clipboard.writeText(evt.target.textContent);
				showPopupMessage('Copied to clipboard');
			}

			if (messageTime.timeOut) {
				clearTimeout(messageTime.timeOut);
			}

			messageTime.timeOut = setTimeout(() => {
				messageTime.classList?.remove('active');
				messageTime.timeOut = undefined;
			}, 1500);
		}
		if (evt.target?.classList?.contains('imageContainer')) {
			evt.preventDefault();
			evt.stopPropagation();
			if (evt.target.closest('.message')?.dataset.downloaded != 'true') {
				if (evt.target.closest('.message')?.dataset.uid == myId) {
					showPopupMessage('Not sent yet');
				} else {
					showPopupMessage('Not downloaded yet');
				}
				console.log('%cNot availabe yet', 'color: blue');
				return;
			}

			while (lightboxImage.firstChild) {
				lightboxImage.removeChild(lightboxImage.firstChild);
			}

			const imageElement = fragmentBuilder({
				tag: 'img',
				attr: {
					src: evt.target.closest('.messageMain')?.querySelector('.image')?.src,
					class: 'lb',
					alt: 'Image',
				},
			});

			lightboxImage.appendChild(imageElement);

			// eslint-disable-next-line no-undef
			PanZoom(lightboxImage.querySelector('img'));

			lightbox.classList.add('active');
		} else if (evt.target?.closest('.message')?.dataset?.type == 'audio' && evt.target.closest('.main-element')) {

			evt.preventDefault();

			const target = evt.target;
			const audioContainer = target.closest('.audioMessage');
			if (audioContainer == null) {
				return;
			}

			const audio = audioContainer.querySelector('audio');
			//console.log(evt.target);
			if (evt.target.classList.contains('main-element')) {
				//if target audio is not paused, then seek to where is was clicked
				if (!audio.paused) {
					//if audio seek was within the area
					if (evt.offsetX < audioContainer.offsetWidth && evt.offsetX > 0) {
						//if duration is not finite, then set it to 0 and wait for it to be updated
						if (!isFinite(audio.duration)) {
							showPopupMessage('Please wait for the audio to load');
							return;
						}
						const duration = audio.duration;
						//get the calculated time and seek to it
						const time = (evt.offsetX / audioContainer.offsetWidth) * duration;
						seekAudioMessage(audio, time);
					}
				}
			}

			if (target.classList.contains('controls') || target.closest('.controls')) {

				//if play button was clicked
				if (target.classList.contains('fa-play')) {
					//console.log('%cPlaying audio', 'color: green');	
					playAudio(audioContainer);
				} else if (target.classList.contains('fa-pause')) {
					//console.log('%cPausing audio', 'color: blue');
					audio.pause();
				} else if (target.classList.contains('fa-stop')) {
					//console.log('%cStopped audio', 'color: red');
					stopAudio(audio);
				}

			}
		} else if (evt.target?.classList?.contains('reactsOfMessage')) {
			const target = evt.target?.closest('.message')?.querySelectorAll('.reactedUsers .list');
			const container = document.querySelector('.reactorContainer ul');

			while (container.firstChild) {
				container.removeChild(container.firstChild);
			}
			if (target.length > 0) {
				target.forEach(element => {

					const avatar = userInfoMap.get(element.dataset.uid).avatar;
					let name = userInfoMap.get(element.dataset.uid).username;
					name = name == myName ? 'You' : name;

					const listItem = fragmentBuilder({
						tag: 'li',
						childs: [
							{
								tag: 'img',
								attr: {
									src: `/images/avatars/${avatar}(custom).webp`,
									height: 30,
									width: 30
								}
							},
							{
								tag: 'span',
								text: name,
								attr: {
									class: 'uname'
								}
							},
							{
								tag: 'span',
								text: element.textContent,
								attr: {
									class: 'r'
								}
							}
						]
					});

					if (element.dataset.uid == myId) {
						container.prepend(listItem);
					} else {
						container.appendChild(listItem);
					}
				});
			}
			hideOptions();
			document.querySelector('.reactorContainerWrapper').classList.add('active');
			addFocusGlass(false);
		} else if (evt.target?.closest('.messageReply')) {
			const target = evt.target.closest('.messageReply')?.dataset.repid;
			const targetElement = document.getElementById(target);

			if (target && targetElement) {
				try {

					targetElement.classList.add('focused');

					if (backToNormalTimeout) {
						clearTimeout(backToNormalTimeout);
					}

					backToNormalTimeout = setTimeout(() => {
						targetElement.classList.remove('focused');
						backToNormalTimeout = undefined;
					}, 1000);

					if (scrollIntoViewTimeout) {
						clearTimeout(scrollIntoViewTimeout);
					}

					scrollIntoViewTimeout = setTimeout(() => {
						document.getElementById(target).scrollIntoView({ behavior: 'smooth', block: 'start' });
						scrollIntoViewTimeout = undefined;
					}, 120);
				} catch (e) {
					showPopupMessage('Deleted message');
				}
			} else {
				showPopupMessage('Deleted message');
			}
		} else {
			//console.log('Calling hideOptions');
			hideOptions();
		}
	} catch (e) {
		console.log('Error: ', e);
	}
	//hideOptions();
});


/**
 * Handles the click event on the selected files container to remove files from the list of selected files
 * @param {MouseEvent} evt
 */

document.getElementById('selectedFiles').addEventListener('click', (evt) => {
	try {
		//grab the file item element from the target
		const target = evt.target.closest('.file-item');
		//if the target is a valid file item
		if (target) {
			//if the close button was clicked inside the file item
			if (evt.target.classList.contains('close')) {
				//get the file type
				const type = target.dataset?.type;
				//get the image element id
				const id = target.dataset?.id;
				//if the id is valid
				if (id) {
					//if the file type is image, revoke the object url of the image to free up memory
					if (type === 'image') {
						const imageToRemove = target.querySelector('img');
						URL.revokeObjectURL(imageToRemove?.src);
						//console.log(`Image src: ${imageToRemove.src} removed`);
					}
					//remove the file item from the array
					selectedFileArray.splice(selectedFileArray.findIndex(item => item.id === id), 1);
					//console.log('File removed from Array');
					//remove the file item from the DOM
					target.remove();
					//update the items count
					selectedFilesCount.textContent = `${selectedFileArray.length} item${selectedFileArray.length > 1 ? 's' : ''} selected`;
					//if there are no images left, hide the preview
					if (selectedFileArray.length == 0) {
						//close the preview
						//console.log('Closing preview');
						filePreviewContainer.querySelector('.close').click();
					}
				}
			}
		}
	} catch (e) {
		console.log(e);
	}
});


// Initialize a variable to keep track of the last audio message played
let lastPlayedAudioMessage = null;

/**
* Plays an audio file contained within a given HTMLAudioElement container
@param {HTMLAudioElement} audioContainer - The container element for the audio file
@returns
*/
function playAudio(audioContainer) {

	try {
		// Get the audio element from the container
		const audio = audioContainer.querySelector('audio');

		// Check if the audio file is ready to be played
		if (!audioContainer.dataset?.src) {
			showPopupMessage('Audio is not ready to play');
			return;
		}

		// If the audio file source is not set, set it to the container's data source
		if (!audio.src) {
			audio.src = audioContainer.dataset?.src;
		}

		// Check if the audio duration is a finite number
		//console.log(`Audio duration is ${audio.duration}`);
		if (!isFinite(audio.duration)) {
			audio.dataset.duration = audioContainer.dataset?.duration || 0;
			//console.log(`Audio duration is infinity and is set to ${audio.dataset.duration}`);
		}

		// Get the time element for the audio file
		const timeElement = audioContainer.querySelector('.time');

		// If there was a previous audio message playing and the current message is different, stop the previous message
		if (!!lastPlayedAudioMessage && lastPlayedAudioMessage.src != audio.src) {
			//console.log('Calling stop audio to stop last audio');
			stopAudio(lastPlayedAudioMessage);
		}

		// Set the last audio message played to the current audio message
		lastPlayedAudioMessage = audio;

		// When the audio time is updated, update the audio message time and progress bar
		lastPlayedAudioMessage.ontimeupdate = () => {
			//updateAudioMessageTime(audioMessage);
			//if audio.duration is number
			const percentage = updateAudioMessageTimer(audio, timeElement);
			audioContainer.style.setProperty('--audioMessageProgress', `${percentage}%`);
		};

		// When the audio has ended, reset the play/pause button and progress bar
		lastPlayedAudioMessage.onended = () => {
			audioContainer.querySelector('.play-pause i').classList.replace('fa-pause', 'fa-play');
			lastPlayedAudioMessage.currentTime = 0;
			audioContainer.style.setProperty('--audioMessageProgress', '0%');
		};

		// When the audio is paused, update the play/pause button to "play"
		lastPlayedAudioMessage.onpause = () => {
			audioContainer.querySelector('.play-pause i').classList.replace('fa-pause', 'fa-play');
		};

		// When the audio is stalled (e.g. due to slow network), update the play/pause button to "play"
		lastPlayedAudioMessage.onstalled = () => {
			audioContainer.querySelector('.play-pause i').classList.replace('fa-pause', 'fa-play');
		};

		// When the audio is playing (e.g. from another tab), update the play/pause button to "pause"
		lastPlayedAudioMessage.onplaying = () => {
			audioContainer.querySelector('.play-pause i').classList.replace('fa-play', 'fa-pause');
		};

		// Play the audio message
		lastPlayedAudioMessage.play();
	} catch (err) {
		console.log(err);
	}
}

/**
 * Stops the audio playback and resets the time
 *
 * @param {HTMLAudioElement} audio - The audio element to stop
 */
function stopAudio(audio) {
	// Reset the current time of the audio to 0
	audio.currentTime = 0;
	// Pause the audio playback
	audio.pause();
	// Set the audio element to undefined
	audio = undefined;
}

/**
 * Sets the current time of an HTML audio element to the specified time in seconds.
 * @param {HTMLAudioElement} audio - the HTML audio element to seek
 * @param {number} time - the time in seconds to seek to
 */
function seekAudioMessage(audio, time) {
	try {
		// Set the current time of the audio element to the specified time, or 0 if time is not a valid number
		audio.currentTime = isNaN(time) ? 0 : time;
	} catch (e) {
		// Log any errors that occur while setting the current time
		console.log('seekAudioMessage error - Time: ', time, 'Audio: ', audio);
	}
}


document.querySelector('.reactorContainerWrapper').addEventListener('click', (evt) => {
	if (evt.target.classList.contains('reactorContainerWrapper')) {
		hideOptions();
	}
});

let softKeyboardActive = false;

const maxWindowHeight = window.visualViewport.height;

serverMessage({text: 'Welcome to Poketab Messenger'}, 'info');

textbox.addEventListener('blur', () => {
	if (softKeyboardActive){
		textbox.focus();
	}
});

window.addEventListener('resize', () => {
	appHeight();
	const temp = scrolling;
	
	scrolling = temp;
	
	setTimeout(() => {
		scrolling = false;
		lastPageLength = messages.scrollTop;
		const lastMsg = messages.querySelector('.message:last-child');
		if (lastMsg) {
			lastMsg.scrollIntoView();
		}
	}, 100);

	softKeyboardActive = window.visualViewport.height < maxWindowHeight;

	//serverMessage({text: `Keyboard active: ${softKeyboardActive} | WindowMax: ${maxWindowHeight}, CurrentHeight: ${window.visualViewport.height}`}, 'info', softKeyboardActive ? 'lime': 'red');
});

  

photoButton.addEventListener('change', () => {
	ImagePreview();
});

fileButton.addEventListener('change', () => {
	FilePreview(null, false);
});

audioButton.addEventListener('change', () => {
	FilePreview(null, true);
});


function clearFileFromInput() {
	//clear all file inputs
	photoButton.value = '';
	fileButton.value = '';
	audioButton.value = '';
}

/**
 * 
 * @param {File} file 
 * @param {string} type 
 * @returns boolean
 */
function fileIsAcceptable(file, type) {
	if (file.size > 100 * 1024 * 1024) {
		showPopupMessage('File size must be less than 100 mb');
		return false;
	}

	if (type == 'audio') {
		const supportedAudioFormats = ['audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/x-m4a'];
		if (!supportedAudioFormats.includes(file.type)) {
			showPopupMessage('Audio format not supported. Try as file.');
			return false;
		}
	} else if (type == 'image') {
		const supportedImageFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
		if (!supportedImageFormats.includes(file.type)) {
			showPopupMessage('Image format not supported. Try as file.');
			return false;
		}
	}
	return true;
}

/**
 * 
 * @param {FileList} filesFromClipboard 
 * @returns 
 */
function ImagePreview(filesFromClipboard = null) {

	const files = filesFromClipboard || photoButton.files;

	//user can select multiple images upto 3
	if (files.length > 10) {
		showPopupMessage('Maximum 10 images can be sent at a time');
		return;
	}

	//check if all files are acceptable
	for (let i = 0; i < files.length; i++) {
		if (!fileIsAcceptable(files[i], 'image')) {
			return;
		}
	}

	const loadingElementFragment = fragmentBuilder({
		tag: 'span',
		text: 'Reading binary data',
		attr: {
			class: 'load',
			style: `color: ${themeAccent[THEME].secondary}`
		},
		child: {
			tag: 'i',
			attr: {
				class: 'fa-solid fa-gear fa-spin'
			}
		}
	});

	const loadingElement = document.createElement('div');
	loadingElement.append(loadingElementFragment);

	document.getElementById('selectedFiles').append(loadingElement);

	filePreviewContainer.style.display = 'flex';

	try {
		for (let i = 0; i < files.length; i++) {

			const fileURL = URL.createObjectURL(files[i]);
			const fileID = crypto.randomUUID();

			const imageFragment = fragmentBuilder({
				tag: 'img',
				attr: {
					src: fileURL,
					alt: 'image',
					class: 'image-message'
				}
			});

			const fileContainerFragment = fragmentBuilder({
				tag: 'div',
				attr: {
					class: 'container file-item',
					'data-type': 'image',
					'data-id': fileID
				},
				childs: [
					{
						tag: 'i',
						attr: {
							class: 'close fa-solid fa-xmark button clickable'
						}
					},
					{
						Node: imageFragment
					}
				]
			});

			if (i == 0) {
				loadingElement.remove();
			}

			document.getElementById('selectedFiles').append(fileContainerFragment);

			const data = fileURL;
			const ext = files[i].type.split('/')[1];
			const name = files[i].name;
			const size = files[i].size;

			selectedFileArray.push({ data: data, name: name, size: size, ext: ext, id: fileID });

			if (i == files.length - 1) {
				fileSendButton.style.display = 'flex';
				selectedObject = 'image';
				clearFileFromInput();
			}

			imageFragment.onerror = () => {
				URL.revokeObjectURL(fileURL);
				selectedFileArray.length = 0;
				showPopupMessage('Error reading file');
				clearFileFromInput();
				clearTargetMessage();
				clearFinalTarget();
			};
		}

		setTimeout(() => {
			filePreviewContainer.classList.add('active');
			filePreviewOptions.classList.add('active');
		}, 50);

		selectedFilesCount.textContent = `${selectedFileArray.length} item${selectedFileArray.length > 1 ? 's' : ''} selected`;
	} catch (e) {
		console.log(e);
		showPopupMessage('Error reading Image');
		clearFileFromInput();
		clearTargetMessage();
		clearFinalTarget();
	}
}

/**
 * 
 * @param {FileList} filesFromClipboard 
 * @param {boolean} audio 
 * @returns 
 */
function FilePreview(filesFromClipboard = null, audio = false) {

	const files = filesFromClipboard || (audio ? audioButton.files : fileButton.files);

	//user can select multiple files upto 10
	if (files.length > 10) {
		showPopupMessage('Select upto 10 files');
		return;
	}

	//check if all files are acceptable
	for (let i = 0; i < files.length; i++) {
		if (!fileIsAcceptable(files[i], audio ? 'audio' : 'file')) {
			clearFileFromInput();
			return;
		}
	}

	const loadingElementFragment = fragmentBuilder({
		tag: 'span',
		text: 'Reading binary data',
		attr: {
			class: 'load',
			style: `color: ${themeAccent[THEME].secondary}`
		},
		child: {
			tag: 'i',
			attr: {
				class: 'fa-solid fa-gear fa-spin'
			}
		}
	});

	const loadingElement = document.createElement('div');
	loadingElement.append(loadingElementFragment);

	filePreviewContainer.style.display = 'flex';

	try {
		for (let i = 0; i < files.length; i++) {

			if (i == 0) {
				loadingElement.remove();
			}

			let name = files[i].name;
			let size = files[i].size;
			const ext = files[i].type.split('/')[1];

			//convert to B, KB, MB
			if (size < 1024) {
				size = size + 'b';
			} else if (size < 1048576) {
				size = (size / 1024).toFixed(1) + 'kb';
			} else {
				size = (size / 1048576).toFixed(1) + 'mb';
			}

			const data = files[i];
			name = shortFileName(name);
			selectedObject = audio ? 'audio' : 'file';

			const fileID = crypto.randomUUID();

			const fileElementFragment = fragmentBuilder({
				tag: 'div',
				attr: {
					class: 'file_preview file-item',
					'data-type': 'file',
					'data-id': fileID
				},
				childs: [
					{
						tag: 'i',
						attr: {
							class: 'close fa-solid fa-xmark'
						}
					},
					{
						tag: 'i',
						attr: {
							class: `fa-regular icon ${audio ? 'fa-file-audio' : 'fa-file-lines'}`
						}
					},
					{
						tag: 'div',
						attr: {
							class: 'meta'
						},
						childs: [
							{
								tag: 'div',
								attr: {
									class: 'name'
								},
								text: `File: ${name}`
							},
							{
								tag: 'div',
								attr: {
									class: 'size'
								},
								text: `Size: ${size}`
							}
						]
					}
				]
			});

			document.getElementById('selectedFiles').appendChild(fileElementFragment);

			selectedFileArray.push({ data: data, name: name, size: size, ext: ext, id: fileID });

			if (i == files.length - 1) {
				fileSendButton.style.display = 'flex';
				clearFileFromInput();
			}
		}
		setTimeout(() => {
			filePreviewContainer.classList.add('active');
			filePreviewOptions.classList.add('active');
		}, 50);
		selectedFilesCount.textContent = `${selectedFileArray.length} item${selectedFileArray.length > 1 ? 's' : ''} selected`;
	} catch (e) {
		console.log(e);
		showPopupMessage('Error reading File');
		clearFileFromInput();
		clearTargetMessage();
		clearFinalTarget();
	}
}

let fileDropZoneTimeout;

window.addEventListener('dragover', (evt) => {
	evt.preventDefault();
	evt.stopPropagation();
	fileDropZone.classList.add('active');
	if (evt.target.classList.contains('fileDropZoneContent')) {
		document.querySelector('.fileDropZoneContent').style.color = themeAccent[THEME].secondary;
		if (fileDropZoneTimeout) {
			clearTimeout(fileDropZoneTimeout);
		}
	} else {
		document.querySelector('.fileDropZoneContent').style.color = '#fff';
		if (fileDropZoneTimeout) {
			clearTimeout(fileDropZoneTimeout);
		}
	}
	fileDropZoneTimeout = setTimeout(() => {
		fileDropZone.classList.remove('active');
		fileDropZoneTimeout = undefined;
	}, 200);
});

window.addEventListener('drop', (evt) => {
	evt.preventDefault();
	fileDropZone.classList.remove('active');
	if (evt.target.classList.contains('fileDropZoneContent')) {
		if (evt.dataTransfer.files.length > 0) {
			if (Array.from(evt.dataTransfer.files).every(file => file.type.startsWith('image/'))) {
				//set it to photobutton
				photoButton.files = evt.dataTransfer.files;
				photoButton.dispatchEvent(new Event('change'));
			} else {
				//set it to filebutton
				fileButton.files = evt.dataTransfer.files;
				fileButton.dispatchEvent(new Event('change'));
			}
		}
	}
});

//listen for file paste
window.addEventListener('paste', (e) => {
	if (e.clipboardData.files?.length > 0) {
		e.preventDefault();
		//if all files are images
		if (Array.from(e.clipboardData.files).every(file => file.type.startsWith('image/'))) {
			//set it to photobutton
			photoButton.files = e.clipboardData.files;
			photoButton.dispatchEvent(new Event('change'));
		} else {
			//set it to filebutton
			fileButton.files = e.clipboardData.files;
			fileButton.dispatchEvent(new Event('change'));
		}
	}
});

window.addEventListener('offline', function () {
	console.log('offline');
	document.querySelector('.offline .icon i').classList.replace('fa-wifi', 'fa-circle-exclamation');
	document.querySelector('.offline .text').textContent = 'You are offline!';
	document.querySelector('.offline').classList.add('active');
	document.querySelector('.chatBox').classList.add('offl');
	document.querySelector('.offline').style.background = 'var(--primary-dark)';
});

window.addEventListener('online', function () {
	console.log('Back to online');
	document.querySelector('.offline .icon i').classList.replace('fa-circle-exclamation', 'fa-wifi');
	document.querySelector('.offline .text').textContent = 'Back to online!';
	document.querySelector('.offline').style.background = 'limegreen';
	setTimeout(() => {
		document.querySelector('.offline').classList.remove('active');
		document.querySelector('.chatBox').classList.remove('offl');
	}, 1500);
});

sendButton.addEventListener('click', (e) => {

	e.preventDefault();

	if (recordedAudio && sendButton.dataset.role == 'send') {
		sendAudioRecord();
		if (quickReactsEnabled == 'true' && textbox.innerText.trim().length == 0 && sendButton.dataset.role == 'send'){
			sendButton.dataset.role = 'quickEmoji';
		}else{
			sendButton.dataset.role = 'send';
		}
		return;
	}
	if (recorderElement.dataset.recordingstate === 'true') {
		showPopupMessage('Please stop recording first');
		return;
	}

	let message = textbox.innerText.trim();
	const replyData = finalTarget?.type === 'text' ? finalTarget?.message.substring(0, 100) : finalTarget?.message;
	const skipServerSend = Array.from(userInfoMap.keys()).length < 2;
	const tempId = crypto.randomUUID();

	if (sendButton.dataset.role == 'quickEmoji' && quickReactsEnabled == 'true') {
		insertNewMessage(quickReactEmoji, 'text', tempId, myId, { data: replyData, type: finalTarget?.type }, finalTarget?.id, { reply: (finalTarget?.message ? true : false), title: (finalTarget?.message || maxUser > 2 ? true : false) }, {});
		if (skipServerSend) {
			playOutgoingSound();
			document.getElementById(tempId).classList.add('delevered');
		} else {
			chatSocket.emit('message', quickReactEmoji, 'text', myId, { data: replyData, type: finalTarget?.type }, finalTarget?.id, { reply: (finalTarget?.message ? true : false), title: (finalTarget?.message || maxUser > 2 ? true : false) }, function (id, error) {
				playOutgoingSound();
				if (error) {
					console.log(error);
					document.getElementById(tempId).dataset.type = 'error';
					document.getElementById(tempId).querySelector('.messageMain').innerHTML = `<div class="msg text" style="background: red">${error}</div>`;
					return;
				}
				document.getElementById(tempId).classList.add('delevered');
				document.getElementById(tempId).id = id;
				lastSeenMessage = id;
				if (document.hasFocus()) {
					chatSocket.emit('seen', ({ userId: myId, messageId: lastSeenMessage, avatar: myAvatar }));
				}
			});
		}
	}else if (sendButton.dataset.role == 'send') {

		textbox.innerText = '';
		textbox.style.height = 'min-content';

		if (message != null && message.length) {
			scrolling = false;
			if (message.length > 10000) {
				message = message.substring(0, 10000);
				message += '... (message too long)';
			}

			message = emojiParser(message);

			if (isEmoji(message)) {
				//replace whitespace with empty string
				message = message.replace(/\s/g, '');
			}

			const { filteredMessage } = filterMessage(message);

			insertNewMessage(filteredMessage, 'text', tempId, myId, { data: replyData, type: finalTarget?.type }, finalTarget?.id, { reply: (finalTarget?.message ? true : false), title: (finalTarget?.message || maxUser > 2 ? true : false) }, {});

			if (skipServerSend) {
				//console.log('Server replay skipped');
				const msg = document.getElementById(tempId);
				msg?.classList.add('delevered');
				playOutgoingSound();
			} else {
				chatSocket.emit('message', message, 'text', myId, { data: replyData, type: finalTarget?.type }, finalTarget?.id, { reply: (finalTarget?.message ? true : false), title: (finalTarget?.message || maxUser > 2 ? true : false) }, function (id, error) {

					playOutgoingSound();

					if (error) {
						console.log(error);
						document.getElementById(tempId).dataset.type = 'error';
						document.getElementById(tempId).querySelector('.messageMain').innerHTML = `<div class="msg text" style="background: red">${error}</div>`;
						return;
					}

					document.getElementById(tempId).classList.add('delevered');
					document.getElementById(tempId).id = id;
					lastSeenMessage = id;
					if (document.hasFocus()) {
						chatSocket.emit('seen', ({ userId: myId, messageId: lastSeenMessage, avatar: myAvatar }));
					}
				});
			}
		}

	}
	

	clearFinalTarget();
	hideOptions();
	hideReplyToast();

	try {
		clearTimeout(typingStatusTimeout);
	} catch (e) {
		console.log('timeout not set');
	}
	isTyping = false;
	chatSocket.emit('stoptyping');
});

window.addEventListener('focus', () => {
	if (lastNotification != undefined) {
		lastNotification.close();
	}
	chatSocket.emit('seen', ({ userId: myId, messageId: lastSeenMessage, avatar: myAvatar }));
});

function closeFilePreview() {

	filePreviewContainer.classList.remove('active');
	filePreviewOptions.classList.remove('active');

	setTimeout(() => {
		while (document.getElementById('selectedFiles').firstChild) {
			document.getElementById('selectedFiles').removeChild(document.getElementById('selectedFiles').firstChild);
		}
		filePreviewContainer.style.display = 'none';
		selectedFilesCount.textContent = '0 items selected';
	}, 100);
}

filePreviewContainer.querySelector('.close')?.addEventListener('click', () => {
	clearFileFromInput();
	selectedFileArray.length = 0;
	closeFilePreview();
});

fileSendButton.addEventListener('click', () => {

	closeFilePreview();

	//check if image or file is selected
	if (selectedObject === 'image') {
		sendImageStoreRequest();
	} else if (selectedObject === 'file') {
		sendFileStoreRequest(null);
	} else if (selectedObject === 'audio') {
		sendFileStoreRequest('audio');
	}

	hideReplyToast();
});

async function sendImageStoreRequest() {

	for (let i = 0; i < selectedFileArray.length; i++) {
		const image = new Image();
		image.src = selectedFileArray[i].data;
		image.dataset.name = selectedFileArray[i].name;
		image.mimetype = selectedFileArray[i].ext;
		image.onload = async function () {
			//console.log('Inside onload');
			const thumbnail = resizeImage(image, image.mimetype, 50);
			let messageId = crypto.randomUUID();
			scrolling = false;

			insertNewMessage(image.src, 'image', messageId, myId, { data: finalTarget?.message, type: finalTarget?.type }, finalTarget?.id, { reply: (finalTarget?.message ? true : false), title: (finalTarget?.message || maxUser > 2 ? true : false) }, { ext: image.mimetype, size: '', height: image.height, width: image.width, name: image.dataset.name });

			if (Array.from(userInfoMap.keys()).length < 2) {
				//console.log('Server upload skipped');

				const msg = document.getElementById(messageId);
				if (msg == null) {
					return;
				}
				msg.classList.add('delevered');
				msg.dataset.downloaded = 'true';
				msg.querySelector('.circleProgressLoader').remove();
				playOutgoingSound();
			} else {

				const elem = document.getElementById(messageId)?.querySelector('.messageMain');

				if (elem == null) {
					return;
				}

				elem.querySelector('.image').style.filter = 'brightness(0.4)';
				let progress = 0;
				//make xhr request

				//image to file
				const file = await fetch(image.src).then(r => r.blob()).then(blobFile => new File([blobFile], 'image', { type: image.mimetype }));

				if (i == 0) {
					clearFinalTarget();
				}


				fileSocket.emit('fileUploadStart', 'image', thumbnail.data, myId, { data: finalTarget?.message, type: finalTarget?.type }, finalTarget?.id, { reply: (finalTarget?.message ? true : false), title: (finalTarget?.message || maxUser > 2 ? true : false) }, { ext: image.mimetype, size: (image.width * image.height * 4) / 1024 / 1024, height: image.height, width: image.width, name: image.dataset.name }, myKey, (newId) => {
					playOutgoingSound();
					document.getElementById(messageId).classList.add('delevered');
					document.getElementById(messageId).id = newId;
					if (ongoingXHR.has(messageId)) {
						//replace the old key with the new key
						ongoingXHR.set(newId, ongoingXHR.get(messageId));
						//ongoingXHR.delete(messageId);
					}
					messageId = newId;
					lastSeenMessage = newId;
					if (document.hasFocus()) {
						chatSocket.emit('seen', ({ userId: myId, messageId: lastSeenMessage, avatar: myAvatar }));
					}

					//upload image via xhr request
					const xhr = new XMLHttpRequest();

					const progresCircle = elem.querySelector('.circleProgressLoader');
					const progressText = elem.querySelector('.circleProgressLoader .progressPercent');

					xhr.onreadystatechange = function () {
						if (xhr.readyState === XMLHttpRequest.OPENED) {
							// Remove 'inactive' class from element with class 'animated'
							//console.log('Request sent');
							//console.log(`setting ongoing xhr for ${messageId}`);
							ongoingXHR.set(messageId, xhr);
							progressText.textContent = 'Uploading...';
							progresCircle.querySelector('.animated').classList.remove('inactive');
						} else if (xhr.readyState === XMLHttpRequest.DONE) {
							//console.log(`Upload finished with status ${xhr.status}`);
							ongoingXHR.delete(messageId);
							if (xhr.status === 200) {
								// Handle successful response from server
								if (elem) {
									progresCircle.remove();
									progressText.textContent = 'Finishing...';
									elem.querySelector('.image').style.filter = 'none';
								}

								const downloadLink = JSON.parse(xhr.response).downlink;

								const _msg = document.getElementById(messageId);
								_msg.dataset.downloaded = 'true';
								_msg.dataset.downlink = downloadLink;
								fileSocket.emit('fileUploadEnd', messageId, myKey, downloadLink);
							} else {
								// Handle network errors or server unreachable errors
								//console.log('Error: could not connect to server');
								console.log(this.response);
								showPopupMessage(this.response);
								progresCircle.querySelector('.animated').style.visibility = 'hidden';
								progressText.textContent = 'Upload failed';
								fileSocket.emit('fileUploadError', myKey, messageId);
							}
						}
					};

					//send file via xhr post request
					xhr.open('POST', `${location.origin}/api/files/upload/${myKey}/${messageId}/${myId}`, true);
					xhr.upload.onprogress = function (e) {
						if (e.lengthComputable) {
							progresCircle.querySelector('.animated').classList.remove('inactive');
							progress = (e.loaded / e.total) * 100;
							progresCircle.style.strokeDasharray = `${(progress * 251.2) / 100}, 251.2`;
							progressText.textContent = `${Math.round(progress)}%`;
						}
					};

					const formData = new FormData();

					formData.append('file', file);

					xhr.send(formData);
				});

			}

		};
	}
	selectedFileArray.length = 0;
}

/**
 * 
 * @param {string} type Type of file to be sent
 * @returns 
 */
function sendFileStoreRequest(type = null) {

	for (let i = 0; i < selectedFileArray.length; i++) {

		let messageId = crypto.randomUUID();
		scrolling = false;

		const fileData = selectedFileArray[i].data;
		const fileUrl = URL.createObjectURL(fileData);

		if (type && type == 'audio') {
			insertNewMessage(fileUrl, 'audio', messageId, myId, { data: finalTarget?.message, type: finalTarget?.type }, finalTarget?.id, { reply: (finalTarget?.message ? true : false), title: (finalTarget?.message || maxUser > 2 ? true : false) }, { ext: selectedFileArray[i].ext, size: selectedFileArray[i].size, name: selectedFileArray[i].name, duration: selectedFileArray[i].duration });
		} else {
			insertNewMessage(fileUrl, 'file', messageId, myId, { data: finalTarget?.message, type: finalTarget?.type }, finalTarget?.id, { reply: (finalTarget?.message ? true : false), title: (finalTarget?.message || maxUser > 2 ? true : false) }, { ext: selectedFileArray[i].ext, size: selectedFileArray[i].size, name: selectedFileArray[i].name });
		}

		if (Array.from(userInfoMap.keys()).length < 2) {

			const msg = document.getElementById(messageId);
			if (msg == null) {
				return;
			}
			msg.classList.add('delevered');
			msg.dataset.downloaded = 'true';
			msg.querySelector('.progress').style.visibility = 'hidden';
			playOutgoingSound();
		} else {
			let progress = 0;
			const elem = document.getElementById(messageId)?.querySelector('.messageMain');

			if (i == 0) {
				clearFinalTarget();
			}

			fileSocket.emit('fileUploadStart', type ? type : 'file', '', myId, { data: finalTarget?.message, type: finalTarget?.type }, finalTarget?.id, { reply: (finalTarget?.message ? true : false), title: (finalTarget?.message || maxUser > 2 ? true : false) }, { ext: selectedFileArray[i].ext, size: selectedFileArray[i].size, name: selectedFileArray[i].name }, myKey, (newId) => {
				playOutgoingSound();
				document.getElementById(messageId).classList.add('delevered');
				document.getElementById(messageId).id = newId;
				if (ongoingXHR.has(messageId)) {
					//replace the old key with the new key
					ongoingXHR.set(newId, ongoingXHR.get(messageId));
					//ongoingXHR.delete(messageId);
				}
				messageId = newId;
				lastSeenMessage = newId;
				if (document.hasFocus()) {
					chatSocket.emit('seen', ({ userId: myId, messageId: lastSeenMessage, avatar: myAvatar }));
				}

				//upload image via xhr request
				const xhr = new XMLHttpRequest();

				//send file via xhr post request
				xhr.open('POST', `${location.origin}/api/files/upload/${myKey}/${messageId}/${myId}`, true);


				xhr.onreadystatechange = function () {
					if (this.readyState === XMLHttpRequest.OPENED) {
						//console.log(`Connection opened for message id ${messageId}`);
						ongoingXHR.set(messageId, xhr);
					}
					else if (this.readyState === XMLHttpRequest.DONE) {
						//console.log(`Connection closed for message id ${messageId}`);
						ongoingXHR.delete(messageId);
						if (this.status == 200) {
							const _msg = document.getElementById(messageId);

							if (_msg) {
								_msg.dataset.downloaded = 'true';
								_msg.dataset.downlink = JSON.parse(this.response).downlink;
								elem.querySelector('.progress').style.visibility = 'hidden';
								fileSocket.emit('fileUploadEnd', messageId, myKey, JSON.parse(this.response).downlink);
							}
						}
						else {
							console.log(this.response);
							showPopupMessage(this.response);
							elem.querySelector('.progress').textContent = 'Upload failed';
							fileSocket.emit('fileUploadError', myKey, messageId);
						}
					}
				};

				xhr.upload.onprogress = function (e) {
					if (e.lengthComputable) {
						progress = (e.loaded / e.total) * 100;
						elem.querySelector('.progress').textContent = `${Math.round(progress)}%`;
						if (progress === 100) {
							elem.querySelector('.progress').textContent = 'Finishing...';
						}
					}
				};

				const formData = new FormData();

				formData.append('file', fileData);

				xhr.send(formData);
			});
		}

	}
	selectedFileArray.length = 0;
}

let newMsgTimeOut = undefined;
/**
 * 
 * @param {string} message 
 * @param {string} username 
 * @param {string} avatar 
 */
export function notifyUser(message, username, avatar) {
	if (('Notification' in window) && Notification.permission === 'granted') {
		// Check whether notification permissions have already been granted;
		// if so, create a notification
		if (!document.hasFocus()) {
			document.querySelector('title').text = `${username} messaged`;
			if (newMsgTimeOut == undefined) {
				newMsgTimeOut = setTimeout(() => {
					document.querySelector('title').text = 'Inbox';
					newMsgTimeOut = undefined;
				}, 3000);
			}

			lastNotification = new Notification(username, {
				body: message.type == 'Text' ? message.data : message.type,
				icon: `/images/avatars/${avatar}(custom).webp`,
				tag: username,
			});
		}
	} else if (Notification.permission !== 'denied') {
		// We need to ask the user for permission
		Notification.requestPermission().then((permission) => {
			// If the user accepts, let's create a notification
			if (permission === 'granted') {
				if (!document.hasFocus()) {
					document.querySelector('title').text = `${username} messaged`;
					if (newMsgTimeOut == undefined) {
						newMsgTimeOut = setTimeout(() => {
							document.querySelector('title').text = 'Inbox';
							newMsgTimeOut = undefined;
						}, 3000);
					}
					lastNotification = new Notification(username, {
						body: message.type == 'Text' ? message.data : message.type,
						icon: `/images/avatars/${avatar}(custom).webp`,
						tag: username,
					});
				}
			}
		});
	}
}

lightboxSaveButton.addEventListener('click', () => {
	saveImage();
});

function closeAllModals() {
	//console.log('closing all modals');
	activeModals.forEach((modal) => {
		//console.log(`Closing ${modal}`);
		modalCloseMap.get(modal)();
	});
}

/**
 * Handles keyboard shortcuts
 */
document.addEventListener('keydown', (evt) => {

	if (lightbox.classList.contains('active') || filePreviewContainer.classList.contains('active')) {
		//console.log('Skipping keyboard shortcuts because lightbox or file preview is active');
		return;
	}

	const altKeys = ['o', 's', 't', 'i', 'a', 'f', 'p', 'm', 'r'];

	if (altKeys.includes(evt.key) && evt.altKey) {
		//console.log(modalCloseMap);
		//evt.preventDefault();
		closeAllModals();
		switch (evt.key) {
		case 'o':
			showSidePanel();
			break;
		case 's':
			showQuickSettings();
			break;
		case 't':
			showThemes();
			break;
		case 'i':
			showStickersPanel();
			break;
		case 'a':
			addAttachment();
			break;
		case 'f':
			//choose file
			fileButton.click();
			break;
		case 'p':
			//choose photo
			photoButton.click();
			break;
		case 'm':
			//choose audio
			audioButton.click();
			break;
		case 'r':
			//record voice
			recordButton.click();
		}
		return;
	}

	//if escape key is pressed, close last opened modal
	if (evt.key === 'Escape') {
		if (activeModals.length > 0) {
			evt.preventDefault();
			const close = activeModals[activeModals.length - 1];
			//console.log(`closing ${close}`);
			modalCloseMap.get(close)();
		}
		return;
	}

	if (evt.key === 'Enter' && messageSendShortCut === 'Enter' && !evt.ctrlKey) { // if Enter key is pressed
		//if shift+enter is pressed, then add a new line
		if (evt.shiftKey) {
			return;
		}
		evt.preventDefault(); // prevent default behavior of Enter key
		if (sendButton.dataset.role == 'quickEmoji') {
			return;
		}
		sendButton.click();
	} else if (evt.key === 'Enter' && messageSendShortCut === 'Ctrl+Enter' && evt.ctrlKey) { // if Ctrl+Enter key is pressed
		if (sendButton.dataset.role == 'quickEmoji') {
			return;
		}
		sendButton.click();
	}
	return;
});

const chooseQuickEmojiButton = document.getElementById('chooseQuickEmojiButton');

chooseQuickEmojiButton.addEventListener('click', () => {
	//chooseQuickEmoji();
	hideQuickSettings();
	moreReactsContainer.dataset.role = 'quickEmoji';
	moreReactsContainer.classList.add('active');

});


let locationTimeout = undefined;

document.getElementById('send-location').addEventListener('click', () => {
	let show = true;
	if (!navigator.geolocation) {
		showPopupMessage('Geolocation not supported by your browser.');
		return;
	}
	navigator.geolocation.getCurrentPosition((position) => {
		if (!show) return;
		showPopupMessage('Tracing your location...');
		chatSocket.emit('createLocationMessage', {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		});
	}, (error) => {
		showPopupMessage(error.message);
	});

	if (locationTimeout) {
		clearTimeout(locationTimeout);
		locationTimeout = undefined;
	}

	locationTimeout = setTimeout(() => {
		showPopupMessage('Error occured. Please try again.');
		locationTimeout = undefined;
		show = false;
	}, 5000);
});


export function setTypingUsers() {
	const typingString = getTypingString(userTypingMap);
	if (typingString == '') {
		document.getElementById('typingIndicator').classList.remove('active');
	} else {
		document.getElementById('typingIndicator').querySelector('.text').textContent = typingString;
		document.getElementById('typingIndicator').classList.add('active');
	}
}

/**
 * Expands the reaction keyboard to the full view.
 */
expandReactButton.addEventListener('click', () => {
	const expanded = moreReactsContainer.dataset.expanded;
	if (expanded == 'true') {
		moreReactsContainer.dataset.expanded = 'false';
	} else {
		moreReactsContainer.dataset.expanded = 'true';
	}
});

//record button onclick
recordButton.addEventListener('click', () => {
	//recorderElement.classList.add('active');
	//if the recorder is not recording
	if (recorderElement.dataset.recordingstate === 'false') {
		if (recordedAudio && audioChunks.length > 0) {
			//stateDisplay.textContent = 'Stopped';
			if (recordButton.dataset.playstate == 'stop') {
				//console.log('%cAudio stop', 'color: red');
				//stop playing recorded audio
				stopPlayingRecordedAudio();
			} else {
				//play recorded audio
				playRecordedAudio();
				//stateDisplay.textContent = 'Playing';
			}
		} else {
			//start recording
			startRecording();
			//stateDisplay.textContent = 'Recording';
		}
	} else {
		//stop recording
		stopRecording();
		//stateDisplay.textContent = 'Idle';
	}
});

//cancel button onclick
cancelVoiceRecordButton.addEventListener('click', () => {
	//if the recorder is not recording
	if (recorderElement.dataset.recordingstate === 'true') {
		//stop recording
		stopRecording();
		showPopupMessage('Voice message cancelled');
	}
	//reset for new recording
	recordCancel = true;
	if (sendButton.dataset.role == 'send' && quickReactsEnabled == 'true') {
		sendButton.dataset.role = 'quickEmoji';
	}

	stopRecording();
	stopPlayingRecordedAudio();
	resetForNewRecording();
	//recordButton.textContent = 'record';
	micIcon.classList.replace('fa-stop', 'fa-microphone');
	micIcon.classList.replace('fa-play', 'fa-microphone');
	recordButton.dataset.playstate = 'play';
	recorderElement.classList.remove('active');
	//stateDisplay.textContent = 'Idle';
});

//reset for new recording
function resetForNewRecording() {
	//clear the recorded audio
	//delete from URL
	if (recordedAudio) {
		URL.revokeObjectURL(recordedAudio.src);
	}
	recordedAudio = '';
	audioChunks.length = 0;
	//clear the timer
	recorderTimer.textContent = '00:00';
	document.documentElement.style.setProperty('--amplitude', '0px');
}

//start recording
function startRecording() {
	//reset for new recording
	resetForNewRecording();
	//start recording
	startRecordingAudio();
}

//stop recording
function stopRecording() {
	//change the recording state to false
	recorderElement.dataset.recordingstate = 'false';
	if (recordButton.dataset.playstate === 'stop') {
		//recordButton.textContent = 'play';
		micIcon.classList.replace('fa-stop', 'fa-play');
		micIcon.classList.replace('fa-microphone', 'fa-play');
		recordButton.dataset.playstate = 'play';
	}
	if (autoStopRecordtimeout) {
		clearTimeout(autoStopRecordtimeout);
	}
	//stop the timer
	stopTimer();
	//stop recording
	stopRecordingAudio();
}

//start recording audio
function startRecordingAudio() {
	//get the audio stream
	navigator.mediaDevices.getUserMedia({ audio: true })
		.then(function (s) {
			stream = s;
			//process the audio stream
			//use low quality audio and mono channel and 32kbps
			const mediaRecorder = new MediaRecorder(stream, { type: 'audio/mp3;', audioBitsPerSecond: 32000, audioChannels: 1 });
			//start recording
			mediaRecorder.start();
			startTimer();
			showPopupMessage('Recording...');

			playStartRecordSound();

			micIcon.classList.replace('fa-play', 'fa-stop');
			micIcon.classList.replace('fa-microphone', 'fa-stop');
			recordButton.dataset.playstate = 'stop';
			recorderElement.dataset.recordingstate = 'true';
			recorderElement.classList.add('active');

			recordCancel = false;
			const maxRecordTime = 60;
			let timePassed = 0;

			let timerInterval = setInterval(() => {
				timePassed += 1;
				if (timePassed >= maxRecordTime) {
					clearInterval(timerInterval);
				}
			}, 1000);


			if (autoStopRecordtimeout) {
				clearTimeout(autoStopRecordtimeout);
			}

			autoStopRecordtimeout = setTimeout(() => {
				mediaRecorder.stop();
				stopRecording();
				clearInterval(timerInterval);
				autoStopRecordtimeout = undefined;
				timerInterval = undefined;
				//console.log('%cAuto Stop Record', 'color: red');
			}, 1 * maxRecordTime * 1000);

			//when the media recorder stops recording
			mediaRecorder.onstop = function () {
				if (!recordCancel) {
					const audioBlob = new Blob(audioChunks, { type: 'audio/mp3;', audioBitsPerSecond: 32000, audioChannels: 1 });
					recordedAudio = new Audio();
					recordedAudio.src = URL.createObjectURL(audioBlob);
					recordedAudio.load();
					recordedAudio.dataset.duration = timePassed;
					recordCancel = false;
					showPopupMessage('Recorded!');
					if (recordedAudio){
						console.log('recorded audio duration: ', recordedAudio.dataset.duration);
						if (quickReactsEnabled == 'true' && sendButton.dataset.role == 'quickEmoji') {
							sendButton.dataset.role = 'send';
						}
					}
					//console.log('recorder state: ', mediaRecorder.state);
					//console.log(`Duration: ${recordedAudio.dataset.duration} seconds`);
				}
			};
			//when the media recorder gets data
			mediaRecorder.ondataavailable = function (e) {
				audioChunks.push(e.data);
			};
		})
		.catch(function (err) {
			console.log('The following error occured: ' + err);
			showPopupMessage(err);
		});
}

//stop recording audio
function stopRecordingAudio() {
	//stop the audio stream
	stream?.getTracks().forEach(track => track.stop());
}

/**
 * 
 * @param {HTMLAudioElement} audio 
 * @param {HTMLElement} timerDisplay
 * @returns 
 */
function updateAudioMessageTimer(audio, timerDisplay) {
	const currentTime = audio.currentTime;
	const duration = isFinite(audio.duration) ? audio.duration : audio.dataset?.duration;
	const percentage = (currentTime / duration) * 100;

	timerDisplay.textContent = remainingTime(duration, currentTime);
	return percentage;
}

//play recorded audio
function playRecordedAudio() {

	micIcon.classList.replace('fa-play', 'fa-stop');
	micIcon.classList.replace('fa-microphone', 'fa-stop');
	recorderElement.dataset.recordingstate = 'false';
	recordButton.dataset.playstate = 'stop';

	if (recordedAudio) {
		//recordedAudio.currentTime = 0;
		recordedAudio.play();

		//updates the timer
		recordedAudio.addEventListener('timeupdate', () => {
			//if recordedaudio.duration is a number
			const percentage = updateAudioMessageTimer(recordedAudio, recorderTimer);
			recorderElement.style.setProperty('--recordedAudioPlaybackProgress', percentage + '%');
		});

		//after recorded audio is done playing.
		recordedAudio.onended = function () {
			micIcon.classList.replace('fa-stop', 'fa-play');
			micIcon.classList.replace('fa-microphone', 'fa-play');
			recordButton.dataset.playstate = 'play';

			recorderTimer.textContent = '00:00';
			recorderElement.style.setProperty('--recordedAudioPlaybackProgress', '0%');
		};
	}
}

//stop playing recorded audio
function stopPlayingRecordedAudio() {
	if (recordedAudio) {
		recordedAudio.pause();
		recorderElement.style.setProperty('--recordedAudioPlaybackProgress', '0%');
	}
	micIcon.classList.replace('fa-stop', 'fa-play');
	micIcon.classList.replace('fa-microphone', 'fa-play');
	recordButton.dataset.playstate = 'play';
	recorderTimer.textContent = '00:00';
}

//sends recorded audio
function sendAudioRecord() {
	//convert Audio to File
	fetch(recordedAudio.src)
		.then(response => response.blob())
		.then(audioBlob => {
			// Create a File object from the Blob object
			const file = new File([audioBlob], `Poketab-recording-${Date.now()}.mp3`, { type: 'audio/mpeg' });

			// You can now use the audioFile object as a File object
			const data = file;
			const name = file.name;
			const size = file.size;
			const ext = 'mp3';
			const duration = recordedAudio.dataset.duration;

			const fileID = crypto.randomUUID();

			selectedFileArray.length = 0;
			selectedFileArray.push({ data, name, size, ext, id: fileID, duration: duration });

			selectedObject = 'audio';

			sendFileStoreRequest('audio');
			cancelVoiceRecordButton.click();
		});
}

//starts the recording state timer
function startTimer() {
	//set the timer to 00:00
	recorderTimer.textContent = '00:00';
	stopTimer();
	//console.log('%cstarted timer', 'color: orange');
	//set the timer interval
	let sec = 0;
	let min = 0;
	timerInterval = setInterval(() => {
		sec++;
		if (sec === 60) {
			sec = 0;
			min++;
		}
		//display the timer
		recorderTimer.textContent = min.toString().padStart(2, '0') + ':' + sec.toString().padStart(2, '0');
	}, 1000);
}

//stops the recording state timer
function stopTimer() {
	if (timerInterval) {
		//clear the timer interval
		clearInterval(timerInterval);
		timerInterval = null;
		recorderTimer.textContent = '00:00';
		//console.log('%cstopped timer', 'color: red');
	}
}

//clear the previous thumbnail when user gets the file completely
export function clearDownload(element, fileURL, type) {
	playOutgoingSound();
	if (element.closest('.message').dataset.deleted === 'true') return;
	if (type === 'image') {
		setTimeout(() => {
			element.querySelector('.circleProgressLoader').remove();
			element.querySelector('.image').src = fileURL;
			element.querySelector('.image').alt = 'image';
			element.querySelector('.image').style.filter = 'none';
		}, 50);
	} else if (type === 'file' || type === 'audio') {
		setTimeout(() => {
			element.querySelector('.msg').dataset.src = fileURL;
			element.querySelector('.progress').style.visibility = 'hidden';
		}, 50);
	}
	element.closest('.message').dataset.downloaded = 'true';
}

export let loginTimeout = undefined;
export let slowInternetTimeout = undefined;
//on dom ready, show 'Slow internet' if 3 sec has been passed
document.addEventListener('DOMContentLoaded', () => {
	try {
		loginTimeout = setTimeout(() => {
			if (!loginTimeout) return;
			const preload = document.getElementById('preload');
			preload.querySelector('.text').textContent = 'Logging in';
			clearTimeout(slowInternetTimeout);
		}, 1000);
		//show slow internet if 3 sec has been passed
		slowInternetTimeout = setTimeout(() => {
			if (!slowInternetTimeout) return;
			const preload = document.getElementById('preload');
			preload.querySelector('.text').textContent = 'Slow internet';
			clearTimeout(loginTimeout);
		}, 8000);
	} catch (e) {
		console.log(e);
	}
});


let exitpressed = false;
let lastBackPressTime = 0;

(() => {
	history.pushState({}, '', '');
	history.pushState({}, '', '');
	history.pushState({}, '', '');
	history.pushState({}, '', '');
	history.pushState({}, '', '');

	window.onpopstate = () => {
		const currentTime = new Date().getTime();
		const timeDifference = currentTime - lastBackPressTime;

		// If exitpressed is already true and the time difference is less than 1000ms
		if (exitpressed && timeDifference <= 1000) {
			showPopupMessage('Please log out to exit');
			exitpressed = false;
		} else {
			exitpressed = true;

			// Reset exitpressed after 1 second
			setTimeout(() => {
				exitpressed = false;
			}, 1000);
		}

		lastBackPressTime = currentTime;

		// Execute escape key event
		const event = new KeyboardEvent('keydown', { key: 'Escape' });
		document.dispatchEvent(event);
		softKeyboardActive = false;
		//serverMessage({text: `Soft keyboard active: ${softKeyboardActive}`}, null, 'pink');

		// Navigate forward in history
		history.forward();
	};
})();