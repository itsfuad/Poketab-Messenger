//enable strict mode
'use strict';

//bundles

import {io} from 'socket.io-client';
import Mustache from 'mustache';
import {Stickers} from './../stickers/stickersConfig';

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
const options = document.querySelector('.options');
const copyOption = document.querySelector('.copyOption');
const downloadOption = document.querySelector('.downloadOption');
const deleteOption = document.querySelector('.deleteOption');
const replyOption = document.querySelector('.replyOption');
const fileDropZone = document.querySelector('.fileDropZone');

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

const reactArray = ['💙', '😂','😮','😢','😠','👍🏻','👎🏻'];
//here we add the usernames who are typing
const userTypingMap = new Map();
//all the user and their info is stored in this map
const userInfoMap = new Map();
const fileBuffer = new Map();

let softKeyIsUp = false; //to check if soft keyboard of phone is up or not
let scrolling = false; //to check if user is scrolling or not
let lastPageLength = messages.scrollTop; // after adding a new message the page size gets updated
let scroll = 0; //total scrolled up or down by pixel
let selectedImage = {
    data: '',
    name: '',
    size: '',
    ext: ''
}
let selectedFile = {
    data: '',
    name: '',
    size: '',
    ext: ''
};
let selectedObject = '';
//the message which fires the event
let targetMessage = {
    sender: '',
    message: '',
    type: '',
    id: '',
};

let targetFile = {
    fileName: '',
    fileData: ''
}

//after the message is varified we store the message info here
let finalTarget = {
    sender: '',
    message: '',
    type: '', 
    id: '',
};

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
        ["touchstart", "mousedown"].forEach(eventName => {
          try{
            this.target.addEventListener(eventName, this._onHoldStart.bind(this));
          }
          catch(e){
            console.log(e);
          }
        });
        //event added to detect if the user is moving the finger or mouse
        ["touchmove", "mousemove"].forEach(eventName => {
          try{
            this.target.addEventListener(eventName, this._onHoldMove.bind(this));
          }
          catch(e){
            console.log(e);
          }
        });
        // event added to detect if the user is releasing the finger or mouse
        ["mouseup", "touchend", "mouseleave", "mouseout", "touchcancel"].forEach(eventName => {
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
        let isDeleted = evt.target.closest('.message').dataset.deleted == 'true' ? true : false;
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
            let isMessage = evt.target.closest('.message') ?? false;
            let isDeleted = evt.target.closest('.message')?.dataset.deleted == 'true' ? true : false;
            if (isMessage && !isDeleted){
                OptionEventHandler(evt);
            }
        }
    });
}


//functions

//sets the app height to the max height of the window
function appHeight () {
    const doc = document.documentElement;
    doc.style.setProperty('--app-height', `${window.innerHeight}px`);
}

//this function generates a random id
function makeId(length = 10){
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++){
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

//this function inserts a message in the chat box
function insertNewMessage(message, type, id, uid, reply, replyId, options, metadata){
    //detect if the message has a reply or not

    if (!options){
        options = {
            reply: false,
            title: false
        };
    }
    if (options.reply){
        //check if the replyid is available in the message list
        if (!document.getElementById(replyId)){
            reply = {data: 'Message is not available on this device', type: 'text'};
        }
    }
    //console.log(type);
    let classList = ''; //the class list for the message. Initially empty. 
    let lastMsg = messages.querySelector('.message:last-child'); //the last message in the chat box
    let popupmsg = ''; //the message to be displayed in the popup if user scrolled up 
    let messageIsEmoji = isEmoji(message); //detect if the message is an emoji or not
    if (type === 'text'){ //if the message is a text message
        popupmsg = message.length > 20 ? `${message.substring(0, 20)} ...` : message; //if the message is more than 20 characters then display only 20 characters
        message = messageFilter(message); //filter the message
        message = `<p class='text'>${message}</p>`
    }else if(type === 'image'){ //if the message is an image
        popupmsg = 'Image'; //the message to be displayed in the popup if user scrolled up
        message = `<img class='image' src='${message}' alt='image' height='${metadata.height}' width='${metadata.width}' /><div class='sendingImage'>Wait..</div>`; //insert the image
    }else if (type === 'sticker'){
        popupmsg = 'Sticker';
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
    let avatar = userInfoMap.get(uid)?.avatar;
    if (username == myName){username = 'You';}
    let repliedTo = userInfoMap.get(document.getElementById(replyId)?.dataset?.uid)?.name;
    if (repliedTo == myName){repliedTo = 'You';}
    if (repliedTo == username){repliedTo = 'self';}

    let template, html;
    let replyMsg, replyFor;
    if (reply.type === 'text' || reply.type === 'file'){
        replyMsg = reply.data;
        replyFor = 'message';
    }else if (reply.type === 'image'){
        replyMsg = document.getElementById(replyId)?.querySelector('.messageMain .image').outerHTML.replace('class="image"', 'class="image imageReply"')
        replyFor = 'image';
    }else if (reply.type === 'sticker'){
        replyMsg = document.getElementById(replyId)?.querySelector('.messageMain .sticker').outerHTML.replace('class="sticker"', 'class="sticker imageReply"')
        replyFor = 'image';
    }
    //console.dir(reply);
    if (type === 'file'){
        popupmsg = 'File';
        template = document.getElementById('fileTemplate').innerHTML;
        html = Mustache.render(template, {
            classList: classList,
            avatar: `<img src='/images/avatars/${avatar}(custom).png' width='30px' height='30px' alt='avatar' />`,
            messageId: id,
            uid: uid,
            repId: replyId,
            title: options.reply? `${username} replied to ${repliedTo? repliedTo: 'a message'}` : username,
            data: message,
            fileName: metadata.name,
            fileSize: metadata.size,
            ext: metadata.ext,
            replyMsg: replyMsg,
            replyFor: replyFor,
            time: getCurrentTime()
        });
    }else{
        template  = document.getElementById('messageTemplate').innerHTML; //loads the template from the html
        html = Mustache.render(template, {
            classList: classList,
            avatar: `<img src='/images/avatars/${avatar}(custom).png' width='30px' height='30px' alt='avatar' />`,
            messageId: id,
            uid: uid,
            repId: replyId,
            title: options.reply? `${username} replied to ${repliedTo? repliedTo: 'a message'}` : username,
            message: message,
            replyMsg: replyMsg,
            replyFor: replyFor,
            time: getCurrentTime()
        });
    }
    /*
    messages.innerHTML += html;
    */
   //similar to the above but a bit secured
    const fragment = document.createDocumentFragment();
    fragment.append(document.createRange().createContextualFragment(html));
    messages.append(fragment);
    if (reply.type == 'image' || reply.type == 'sticker'){
            document.getElementById(id).querySelector('.messageReply')?.classList.add('imageReply');
    }
    lastPageLength = messages.scrollTop;
    updateScroll(userInfoMap.get(uid)?.avatar, popupmsg);
}

function getCurrentTime(){
    //return time in hh:mm a format
    let date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    let strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function messageFilter(message){
    message = censorBadWords(message); //check if the message contains bad words
    message = linkify(message); //if the message contains links then linkify the message
    message = message.replaceAll(/```¶/g, '```'); //replace the code block markers
    message = message.replaceAll(/```([^`]+)```/g, '<code>$1</code>'); //if the message contains code then replace it with the code tag
    message = message.replaceAll('¶', '<br>'); //if the message contains new lines then replace them with <br>
    return message;
}

function emojiParser(text){
    const emojiMap = new Map();
    emojiMap.set(':)', '🙂');
    emojiMap.set(`:'(`, '😢');
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
    emojiMap.set('<3', '💙');
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

    //find if the message contains the emoji
    for (let [key, value] of emojiMap){
        if (text.indexOf(key) != -1){
            let position = text.indexOf(key);
            //all charecter regex
            let regex = /[a-zA-Z0-9_!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]/;
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

/*
function emo_test(str) {
    return emoji_regex.test(str);
}
*/

//returns true if the message contains only emoji
function isEmoji(text) {
    //replace white space with empty string
   if(/^([\uD800-\uDBFF][\uDC00-\uDFFF])+$/.test(text)){
        text = text.replace(/\s/g, '');
        return true;
   }   
}

function showOptions(type, sender, target){
    vibrate();
    //removes all showing options first if any
    document.querySelector('.reactorContainerWrapper').classList.remove('active');
    document.querySelectorAll(`#reactOptions div`).forEach(
        option => option.style.background = 'none'
    );
    if (target.classList.contains('imageReply')){
        return;
    }
    //if the message is a text message
    if (type === 'text'){
        copyOption.style.display = 'flex';
    }else if (type === 'image'){ //if the message is an image
        if (target.closest('.message')?.dataset.downloaded != 'true'){  
            if (target.closest('.message')?.dataset.uid == myId){
                popupMessage('Not sent yet');
            }else{
                popupMessage('Not downloaded yet');
            }
            console.log('%cNot availabe yet', 'color: red');
            return;
        }
        downloadOption.style.display = 'flex';
    }else if (type === 'file'){ //if the message is a file
        if (target.closest('.message')?.dataset.downloaded != 'true'){  
            if (target.closest('.message')?.dataset.uid == myId){
                popupMessage('Not sent yet');
            }else{
                popupMessage('Not downloaded yet');
            }
            console.log('%cNot availabe yet', 'color: red');
            return;
        }
        downloadOption.style.display = 'flex';
    }
    if (sender === true){ //if the message is sent by me
        deleteOption.style.display = 'flex'; //then shgell the delete option
    }else{ //else dont show the delete option
        deleteOption.style.display = 'none';
    }
    //get if the message has my reaction or not
    let clicked = Array.from(target?.closest('.message')?.querySelectorAll('.reactedUsers .list')).reduce((acc, curr) => {
        return acc || curr.dataset.uid == myId;
    }, false);
    if (clicked){ //if the message has my reaction
        //get how many reactions the message has
        let clickedElement = target?.closest('.message')?.querySelector(`.reactedUsers [data-uid="${myId}"]`)?.textContent;
        //selected react color
        document.querySelector(`#reactOptions .${clickedElement}`).style.background = themeAccent[localStorage.getItem("theme")].secondary;
    }
    //show the options
    let options = document.getElementById('optionsContainerWrapper');
    options.style.display = 'grid';
    setTimeout(() => {
        options.classList.add('active');
        document.getElementById('focus_glass').classList.add('active');
        options.addEventListener('click', optionsMainEvent);
    }, 20);
}

function optionsMainEvent(e){
    let target = e.target?.parentNode?.classList[0];
    if (target){
        hideOptions();
    }
    optionsReactEvent(e);
}

function deleteMessage(messageId, user){
    let message = document.getElementById(messageId);
    if (message){ //if the message exists
        //delete all content inside message .messageMain
        while (message.querySelector('.messageMain').firstChild){
            message.querySelector('.messageMain').removeChild(message.querySelector('.messageMain').firstChild);
        }
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
            message.classList.remove('reply');
            message.classList.remove('react');
        }
        let replyMsg = document.querySelectorAll(`[data-repid='${messageId}']`);
        if (replyMsg != null) {
          replyMsg.forEach(element => {
            element.classList.remove('imageReply');
            element.style.background = '#000000c4';
            element.style.color = '#7d858c';
            element.textContent = `${user == myName ? 'You': user} deleted this message`;
          });
        }
        lastPageLength = messages.scrollTop;
    }
}

function downloadHandler(){
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
    let a = document.createElement('a');
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
    let data = targetFile.fileData;
    let fileName = targetFile.fileName;
    //let filetype = filename.split('.').pop();
    let a = document.createElement('a');
    a.href = data;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function optionsReactEvent(e){
    let target = e.target?.classList[0];
    let messageId = targetMessage.id;
    if (target){
        if (reactArray.includes(target)){
            socket.emit('react', target, messageId, myId);
            hideOptions();
        }
    }
}

function hideOptions(){
    let options = document.getElementById('optionsContainerWrapper');
    options.classList.remove('active');
    document.getElementById('sidebar_wrapper').classList.remove('active');
    document.querySelector('.themeChooser').classList.remove('active');
    setTimeout(() => {
        copyOption.style.display = 'none';
        downloadOption.style.display = 'none';
        deleteOption.style.display = 'none';
        options.style.display = 'none';
    }, 20);
    document.getElementById('focus_glass').classList.remove('active');
    document.querySelector('.reactorContainerWrapper').classList.remove('active');
    options.removeEventListener('click', optionsMainEvent);
}


function showReplyToast(){
    hideOptions();
    updateScroll();
    textbox.focus();

    finalTarget = Object.assign({}, targetMessage);
    //console.dir(finalTarget);
    if (finalTarget.type == 'image' || finalTarget.type == 'sticker'){
        replyToast.querySelector('.replyData').appendChild(finalTarget.message);
    }else{
        replyToast.querySelector('.replyData').textContent = finalTarget.message?.substring(0, 50);
    }
    replyToast.querySelector('.username').textContent = finalTarget.sender;
    replyToast.classList.add('active');
}

function hideReplyToast(){
    replyToast.classList.remove('active');
    replyToast.querySelector('.replyData').textContent = '';
    replyToast.querySelector('.username').textContent = '';
    lastPageLength = messages.scrollTop;
    clearTargetMessage();
}

function arrayToMap(array) {
    let map = new Map();
    array.forEach(element => {
        map.set(element.textContent, map.get(element.textContent) + 1 || 1);
    });
    return map;
}

function getReact(type, messageId, uid){
    try{
        let target = document.getElementById(messageId).querySelector('.reactedUsers');
        let exists = target?.querySelector('.list') ?? false;
        if (exists){
            let list = target.querySelector('.list[data-uid="'+uid+'"]');
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
        let list = Array.from(target.querySelectorAll('.list'));
        map = arrayToMap(list);
    
        let reactsOfMessage = document.getElementById(messageId).querySelector('.reactsOfMessage');
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
        }else{
            document.getElementById(messageId).classList.remove('react');
        }
        updateScroll();
    }catch(e){
        console.log("Message not exists");
    }
}


// util functions
function pinchZoom (imageElement) {
    let imageElementScale = 1;
  
    let start = {};
  
    // Calculate distance between two fingers
    const distance = (event) => {
      return Math.hypot(event.touches[0].pageX - event.touches[1].pageX, event.touches[0].pageY - event.touches[1].pageY);
    };
  
    imageElement.addEventListener('touchstart', (event) => {
      if (event.touches.length === 2) {
        event.preventDefault(); // Prevent page scroll
  
        // Calculate where the fingers have started on the X and Y axis
        start.x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
        start.y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
        start.distance = distance(event);
      }
    });
  
    imageElement.addEventListener('touchmove', (event) => {
      if (event.touches.length === 2) {
        event.preventDefault(); // Prevent page scroll
  
        // Safari provides event.scale as two fingers move on the screen
        // For other browsers just calculate the scale manually
        let scale;
        if (event.scale) {
          scale = event.scale;
        } else {
          const deltaDistance = distance(event);
          scale = deltaDistance / start.distance;
        }
        imageElementScale = Math.min(Math.max(1, scale), 4);
  
        // Calculate how much the fingers have moved on the X and Y axis
        const deltaX = (((event.touches[0].pageX + event.touches[1].pageX) / 2) - start.x) * 2; // x2 for accelarated movement
        const deltaY = (((event.touches[0].pageY + event.touches[1].pageY) / 2) - start.y) * 2; // x2 for accelarated movement
  
        // Transform the image to make it grow and move with fingers
        const transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${imageElementScale})`;
        imageElement.style.transform = transform;
        imageElement.style.WebkitTransform = transform;
        imageElement.style.zIndex = "9999";
      }
    });
  
    imageElement.addEventListener('touchend', (event) => {
      // Reset image to it's original format
      imageElement.style.transform = "";
      imageElement.style.WebkitTransform = "";
      imageElement.style.zIndex = "";
    });
}


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

function OptionEventHandler(evt){
    let type;
    let sender = evt.target.closest('.message').classList.contains('self')? true : false;
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
        
        let targetNode = evt.target.closest('.messageMain').querySelector('.image').cloneNode(true);
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
        let targetNode = evt.target.closest('.messageMain').querySelector('.sticker').cloneNode(true);
        targetMessage.message = targetNode;
        targetMessage.type = type;
        targetMessage.id = evt.target?.closest('.message')?.id;
    }
    if (type === 'text' || type === 'image' || type === 'file' || type === 'sticker'){
        //console.log('targetMessage', targetMessage);
        showOptions(type, sender, evt.target);
    }
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
        let messages = document.getElementById('messages');
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
    string += `${array.length > 1 ? ' are ': ' is '} typing...`
    return string;
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
    let canvas = document.createElement('canvas');
    let width = img.width;
    let height = img.height;
    let max_height = q;
    let max_width = q;
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
    let ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);
    return {data: canvas.toDataURL(mimetype, 1), height: height, width: width}; 
}
  
function linkify(inputText) {
let replacedText, replacePattern1, replacePattern2, replacePattern3;
replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');
replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');
replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');
//get the first link
return replacedText;
}


function copyText(text){
    if (text == null){
        text = targetMessage.message;
    }
    navigator.clipboard.writeText(text);
    popupMessage(`Copied to clipboard`);
}


function popupMessage(text){
    //$('.popup-message').text(text);
    document.querySelector('.popup-message').textContent = text;
    //$('.popup-message').fadeIn(500);
    document.querySelector('.popup-message').classList.add('active');
    setTimeout(function () {
        //$('.popup-message').fadeOut(500);
        document.querySelector('.popup-message').classList.remove('active');
    }, 1000);
}

function serverMessage(message, type) {
    let html = `<li class="serverMessage" style="color: ${message.color};">${message.text}</li>`;
    //messages.innerHTML += html;
    const fragment = document.createRange().createContextualFragment(html);
    messages.append(fragment);
    if (type == 'location'){
        updateScroll('location', `${message.user}'s location`);
    }else{
        updateScroll();
    }
}

function vibrate(){
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

let stickerNames;
let stickers = '';
let selectedStickerGroup, selectedStickerGroupCount;

selectedStickerGroup = Stickers[0].name;
selectedStickerGroupCount = Stickers[0].count;

function loadStickers(){
    stickers = '';
    stickerNames = Stickers.map(sticker => {
        return `<img src="/stickers/${sticker.name}/animated/${sticker.icon}.webp" alt="${sticker.name}" data-name="${sticker.name}" class="stickerName clickable">`;
    }).join('');

    for (let i = 1; i <= selectedStickerGroupCount; i++) {
        stickers += `<img src="/stickers/${selectedStickerGroup}/static/${i}.webp" alt="${selectedStickerGroup}-${i}" data-name="${selectedStickerGroup}/animated/${i}" class="stickerpack clickable">`;
    }

    document.getElementById('selectStickerGroup').innerHTML = stickerNames;
    document.getElementById('stickers').innerHTML = stickers;
    //document.querySelector('.names > img[data-name="' + selectedStickerGroup + '"]').style.background = themeAccent[localStorage["theme"]].msg_send;
    document.querySelector('.names > img[data-name="' + selectedStickerGroup + '"]').dataset.selected = 'true';
}

function showStickersPanel(){
    updateScroll();
    loadStickers();
    document.getElementById('stickersPanel').style.display = 'flex';
    setTimeout(() => {
        document.getElementById('focus_glass').classList.add('active');
        document.getElementById('stickersPanel').classList.add('active');
    }, 20);
}

document.getElementById('closeStickersPanel').addEventListener('click', () => {
    lastPageLength = messages.scrollTop;
    closeStickersPanel();
    updateScroll();
});

function closeStickersPanel(){
    document.getElementById('focus_glass').classList.remove('active');
    document.getElementById('stickersPanel').classList.remove('active');
    setTimeout(() => {
        document.getElementById('stickersPanel').style.display = 'none';
    }, 20);
}


//Event listeners
document.querySelector('.stickerBtn').addEventListener('click', () => {
    showStickersPanel();
});

document.getElementById('selectStickerGroup').addEventListener('click', e => {
    if (e.target.tagName === 'IMG') {
        document.getElementById('stickers').innerHTML = `Loading&nbsp;<i class="fa-solid fa-circle-notch fa-spin" style="color: var(--secondary-dark)"></i>`;
        document.getElementById('selectStickerGroup').querySelectorAll('.stickerName')
        .forEach(sticker => {
            sticker.dataset.selected = 'false';
        });
        selectedStickerGroup = e.target.dataset.name;
        selectedStickerGroupCount = Stickers.find(sticker => sticker.name === selectedStickerGroup).count;
        stickers = '';
        for (let i = 1; i <= selectedStickerGroupCount; i++) {
            stickers += `<img src="/stickers/${selectedStickerGroup}/static/${i}.webp" alt="${selectedStickerGroup}-${i}" data-name="${selectedStickerGroup}/animated/${i}" class="stickerpack clickable">`;
        }
        //document.querySelector('.names > img[data-name="' + selectedStickerGroup + '"]').style.background = themeAccent[localStorage["theme"]].msg_send;
        document.querySelector('.names > img[data-name="' + selectedStickerGroup + '"]').dataset.selected = 'true';
        document.getElementById('stickers').innerHTML = stickers;
    }
});

document.getElementById('stickers').addEventListener('click', e => {
    if (e.target.tagName === 'IMG') {
        document.getElementById('stickers').querySelectorAll('.stickerpack')
        .forEach(sticker => {
            sticker.style.background = 'transparent';
        });
        e.target.style.background = themeAccent[localStorage["theme"]].msg_send;
        let tempId = makeId();
        //insertNewMessage(e.target.dataset.name, 'sticker', tempId, myId, finalTarget.message, finalTarget.id, {});
        stickerSound.play();
        scrolling = false;
        updateScroll();
        insertNewMessage(e.target.dataset.name, 'sticker', tempId, myId, {data: finalTarget?.message, type: finalTarget?.type}, finalTarget?.id, {reply: (finalTarget.message ? true : false), title: (finalTarget.message || maxUser > 2 ? true : false)}, {});
        socket.emit('message', e.target.dataset.name, 'sticker', myId, {data: finalTarget?.message, type: finalTarget?.type}, finalTarget?.id, {reply: (finalTarget.message ? true : false), title: (finalTarget.message || maxUser > 2 ? true : false)}, function(id){
            outgoingmessage.play();
            document.getElementById(tempId).classList.add('delevered');
            document.getElementById(tempId).id = id;
        });
        clearTargetMessage();
        clearFinalTarget();
        hideReplyToast();
        closeStickersPanel();
    }
});

document.getElementById('more').addEventListener('click', ()=>{
    document.getElementById('sidebar_wrapper').classList.add('active');
    document.getElementById('focus_glass').classList.add('active');
});

document.querySelectorAll('.keyCopy').forEach(elem => {
    elem.addEventListener('click', ()=>{
        copyText(myKey);
    });
});

document.getElementById('invite').addEventListener('click', ()=>{
    //copy inner link
    copyText(`https://${window.location.host}/join/${myKey}`);
});

document.querySelector('.theme_option').addEventListener('click', ()=>{
    hideOptions();
    document.getElementById('focus_glass').classList.add('active');
    document.querySelector('.themeChooser').classList.add('active');
});

document.querySelector('.themeChooser').addEventListener('click', ()=>{
    document.querySelector('.themeChooser').classList.remove('active');
    hideOptions();
});

document.querySelectorAll('.theme').forEach(theme => {
    theme.addEventListener('click', (evt) => {
        const theme = evt.target.closest('li').id;
        localStorage.setItem('theme', theme);
        //edit css variables
        document.documentElement.style.setProperty('--pattern', `url('../images/backgrounds/${theme}_w.webp')`);
        document.documentElement.style.setProperty('--secondary-dark', themeAccent[theme].secondary);
        document.documentElement.style.setProperty('--msg-get', themeAccent[theme].msg_get);
        document.documentElement.style.setProperty('--msg-get-reply', themeAccent[theme].msg_get_reply);
        document.documentElement.style.setProperty('--msg-send', themeAccent[theme].msg_send);
        document.documentElement.style.setProperty('--msg-send-reply', themeAccent[theme].msg_get_reply);
        document.querySelector('.themeChooser').classList.remove('active');
        hideOptions();
    });
});


messages.addEventListener('scroll', () => {
    scroll = messages.scrollTop;
    let scrolled = lastPageLength-scroll;
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
  if (softKeyIsUp){
    //$('#textbox').trigger('focus');
    textbox.focus();
  }
});

document.querySelector('.close_area').addEventListener('click', (evt) => {
        document.getElementById('sidebar_wrapper').classList.remove('active');
        hideOptions();
});

document.getElementById('attmain').addEventListener('click', (evt) => {
    document.getElementById('attmain').classList.remove('active');
    setTimeout(()=>{
        document.getElementById('attmain').style.display = 'none';
    }, 20);
});

document.getElementById('attachment').addEventListener('click', ()=>{
    document.getElementById('attmain').style.display = 'flex';
    setTimeout(()=>{
        document.getElementById('attmain').classList.add('active');
    }, 20);
});

document.querySelector('.reactOptionsWrapper').addEventListener('click', (evt) => {
    //stop parent event
    if (evt.target.classList.contains('reactOptionsWrapper')){
        hideOptions();
    }
});

messages.addEventListener('click', (evt) => {
    try {
        if (evt.target?.closest('.message')?.contains(evt.target) && !evt.target?.classList.contains('message')){
            evt.target?.closest('.message')?.querySelector('.messageTime')?.classList?.add('active');
            setTimeout(()=>{
                evt.target?.closest('.message')?.querySelector('.messageTime')?.classList?.remove('active');
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
            const fragment = document.createRange().createContextualFragment(`<img src=${evt.target?.src} class='lb'>`);
            document.getElementById('lightbox__image').append(fragment);
            pinchZoom(document.getElementById('lightbox__image').querySelector('img'));
            document.getElementById('lightbox').classList.add('active');
        }
        else if (evt.target?.classList?.contains('reactsOfMessage') || evt.target?.parentNode?.classList?.contains('reactsOfMessage')){
            let target = evt.target?.closest('.message')?.querySelectorAll('.reactedUsers .list');
            let container = document.querySelector('.reactorContainer ul');
            //container.innerHTML = '';
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            if (target.length > 0){
                target.forEach(element => {
                    //let avatar = userList.find(user => user.uid == element.dataset.uid).avatar;
                    let avatar = userInfoMap.get(element.dataset.uid).avatar;
                    //let name = userList.find(user => user.uid == element.dataset.uid).name;
                    let name = userInfoMap.get(element.dataset.uid).name;
                    if (name == myName){name = 'You';}
                    if (element.dataset.uid == myId){
                        //container.innerHTML = `<li><img src='/images/avatars/${avatar}(custom).png' height='30px' width='30px'><span class='uname'>${name}</span><span class='r'>${element.textContent}</span></li>` + container.innerHTML;
                        const fragment = document.createRange().createContextualFragment(`<li><img src='/images/avatars/${avatar}(custom).png' height='30px' width='30px'><span class='uname'>${name}</span><span class='r'>${element.textContent}</span></li>`);
                        container.prepend(fragment);
                    }else{
                        //container.innerHTML += `<li><img src='/images/avatars/${avatar}(custom).png' height='30px' width='30px'><span class='uname'>${name}</span><span class='r'>${element.textContent}</span></li>`;
                        const fragment = document.createRange().createContextualFragment(`<li><img src='/images/avatars/${avatar}(custom).png' height='30px' width='30px'><span class='uname'>${name}</span><span class='r'>${element.textContent}</span></li>`);
                        container.append(fragment);
                    }
                });
            }
            hideOptions();
            document.querySelector('.reactorContainerWrapper').classList.add('active');
            document.getElementById('focus_glass').classList.add('active');
        }
        else if (evt.target?.classList?.contains('messageReply') || evt.target?.classList?.contains('imageReply')){
            if (document.getElementById(evt.target.closest('.messageReply').dataset.repid).dataset.deleted != 'true'){
                try{
                    let target = evt.target.closest('.messageReply')?.dataset.repid;
                    document.querySelectorAll('.message').forEach(element => {
                        if (element.id != target){
                            element.style.filter = 'brightness(0.5)';
                        }
                    });
                    setTimeout(() => {
                        document.querySelectorAll('.message').forEach(element => {
                            if (element.id != target){
                                element.style.filter = '';
                            }
                        });
                    }, 1000);
                    setTimeout(() => {
                                document.getElementById(target).scrollIntoView({behavior: 'smooth', block: 'start'});
                    }, 20);
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
        console.log("Message does not exist");
    }
});


document.querySelector('.reactorContainerWrapper').addEventListener('click', (evt) => {
    if (evt.target.classList.contains('reactorContainerWrapper')){
        hideOptions();
    }
});

window.addEventListener('resize',()=>{
  appHeight();
  let temp = scrolling;
  setTimeout(()=>{
    scrolling = false;
    updateScroll();
  }, 20);
  scrolling = temp;
  softKeyIsUp = maxWindowHeight > window.innerHeight ? true : false;
});

replyOption.addEventListener('click', showReplyToast);
copyOption.addEventListener('click', () => {
    copyText(null);
});
downloadOption.addEventListener('click', downloadHandler);
deleteOption.addEventListener('click', ()=>{
    let uid = document.getElementById(targetMessage.id)?.dataset?.uid;
    if (uid){
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
    document.getElementById('previewImage').querySelector('#imageSend').style.display = 'none';
    while (document.getElementById('selectedImage').firstChild) {
        document.getElementById('selectedImage').removeChild(document.getElementById('selectedImage').firstChild);
    }
    const fragment = document.createRange().createContextualFragment(`<span class='load' style='color: ${themeAccent[localStorage.getItem("theme")].secondary};'>Reading binary data</span>&nbsp;<i class="fa-solid fa-circle-notch fa-spin"></i>`);
    document.getElementById('selectedImage').append(fragment);
    document.getElementById('previewImage')?.classList?.add('active');
    let file = fileFromClipboard || photoButton.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
        let data = e.target.result;
        //localStorage.setItem('selectedImage', data);
        selectedImage.data = data;
        selectedImage.name = file.name;
        selectedImage.ext = file.type.split('/')[1];
        selectedImage.size = file.size;
        selectedObject = 'image';
        //document.getElementById('selectedImage').innerHTML = `<img src="${data}" alt="image" class="image-message" />`;
        while (document.getElementById('selectedImage').firstChild) {
            document.getElementById('selectedImage').removeChild(document.getElementById('selectedImage').firstChild);
        }
        const fragment = document.createRange().createContextualFragment(`<img src="${data}" alt="image" class="image-message" />`);
        document.getElementById('selectedImage').append(fragment);
        document.getElementById('previewImage').querySelector('#imageSend').style.display = 'block';
    }
    //clear photoButton
    photoButton.value = '';
    fileButton.value = '';
}

function FilePreview(fileFromClipboard = null){
    document.getElementById('previewImage').querySelector('#imageSend').style.display = 'none';
    while (document.getElementById('selectedImage').firstChild) {
        document.getElementById('selectedImage').removeChild(document.getElementById('selectedImage').firstChild);
    }
    const fragment = document.createRange().createContextualFragment(`<span class='load' style='color: ${themeAccent[localStorage.getItem("theme")].secondary};'>Reading binary data</span>&nbsp;<i class="fa-solid fa-circle-notch fa-spin"></i>`);
    document.getElementById('selectedImage').append(fragment);
    document.getElementById('previewImage')?.classList?.add('active');
    let file = fileFromClipboard || fileButton.files[0];
    let filename = file.name;
    let size = file.size;

    let extention = filename.split('.').pop();
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

    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
        let data = e.target.result;
        //localStorage.setItem('selectedImage', data);
        selectedFile.data = data;
        selectedFile.name = filename;
        selectedFile.size = size;
        selectedFile.ext = extention;
        selectedObject = 'file';
        //document.getElementById('selectedImage').innerHTML = `<img src="${data}" alt="image" class="image-message" />`;
        while (document.getElementById('selectedImage').firstChild) {
            document.getElementById('selectedImage').removeChild(document.getElementById('selectedImage').firstChild);
        }
        const fragment = document.createRange().createContextualFragment(`<div class='file_preview'><i class="fa-regular fa-file-lines"></i><div>File: ${filename.length >= 25 ? filename.substring(0, 10) + '...' + filename.substring(filename.length - 10, filename.length) : filename}</div><div>Size: ${size}</div></div>`);
        document.getElementById('selectedImage').append(fragment);
        document.getElementById('previewImage').querySelector('#imageSend').style.display = 'block';
    }
    //clear photoButton 
    photoButton.value = '';
    fileButton.value = '';
}


let timeoutObj;

window.addEventListener('dragover', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    fileDropZone.classList.add('active');
    if (evt.target.classList.contains('fileDropZoneContent')){
        document.querySelector('.fileDropZoneContent').style.color = themeAccent[localStorage.getItem("theme")].secondary;
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

window.addEventListener('offline', function(e) { 
    console.log('offline'); 
    document.querySelector('.offline').textContent = 'You are offline!';
    document.querySelector('.offline').classList.add('active');
    document.querySelector('.offline').style.background = 'orangered';
});

window.addEventListener('online', function(e) {
    console.log('Back to online');
    document.querySelector('.offline').textContent = 'Back to online!';
    document.querySelector('.offline').style.background = 'limegreen';
    setTimeout(() => {
        document.querySelector('.offline').classList.remove('active');
    }, 1500);
});

sendButton.addEventListener('click', () => {
    let message = textbox.value?.trim();
    textbox.value = '';
    
    resizeTextbox();
    if (message.length) {
        let tempId = makeId();
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

        let replyData = finalTarget?.type === 'text' ? finalTarget?.message.substring(0, 100) : finalTarget?.message;

        insertNewMessage(message, 'text', tempId, myId, {data: replyData, type: finalTarget?.type}, finalTarget?.id, {reply: (finalTarget.message ? true : false), title: (finalTarget.message || maxUser > 2 ? true : false)}, {});
        socket.emit('message', message, 'text', myId, {data: replyData, type: finalTarget?.type}, finalTarget?.id, {reply: (finalTarget.message ? true : false), title: (finalTarget.message || maxUser > 2 ? true : false)}, function (id) {
            outgoingmessage.play();
            document.getElementById(tempId).classList.add('delevered');
            document.getElementById(tempId).id = id;
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

function sendImageStoreRequest(){
    let image = new Image();
    image.src = selectedImage.data;
    image.mimetype = selectedImage.ext;
    image.onload = async function() {
        let resized = resizeImage(image, image.mimetype);
        let thumbnail = resizeImage(image, image.mimetype, 50);
        let tempId = makeId();
        scrolling = false;

        insertNewMessage(resized.data, 'image', tempId, myId, {data: finalTarget?.message, type: finalTarget?.type}, finalTarget?.id, {reply: (finalTarget.message ? true : false), title: (finalTarget.message || maxUser > 2 ? true : false)}, {ext: image.mimetype, size: resized.data.length, height: resized.height, width: resized.width, name: selectedFile.name});
        //socket.emit('Image', resized, 'image', tempId, myId, finalTarget?.message, finalTarget?.id, {reply: (finalTarget.message ? true : false), title: (finalTarget.message || maxUser > 2 ? true : false)});
        //store image in 100 parts

        let elem = document.getElementById(tempId)?.querySelector('.messageMain');
        elem.querySelector('.image').style.filter = 'brightness(0.4)';

        let progress = 0;
        fileSocket.emit('fileUploadStart', 'image', thumbnail.data, tempId, myId, {data: finalTarget?.message, type: finalTarget?.type}, finalTarget?.id, {reply: (finalTarget.message ? true : false), title: (finalTarget.message || maxUser > 2 ? true : false)}, {ext: image.mimetype, size: resized.data.length, height: resized.height, width: resized.width, name: selectedFile.name}, myKey);
        
        //make xhr request
        //convert resized image to xhr file
        //base64 to file 
        let file = base64ToFile(resized.data, selectedImage.name);
        let formData = new FormData();
        formData.append('key', myKey);
        formData.append('file', file);

        clearFinalTarget();
        //upload image via xhr request
        let xhr = new XMLHttpRequest();
        //send file via xhr post request
        xhr.open('POST', `${location.origin}/api/files`, true);
        xhr.upload.onprogress = function(e) {
            if (e.lengthComputable) {
                progress = (e.loaded / e.total) * 100;
                elem.querySelector('.sendingImage').textContent = '↑ ' + Math.round(progress) + '%';
            }
        };

        xhr.onload = function(e) {
            if (this.status == 200) {
                fileSocket.emit('fileUploadEnd', tempId, myKey, JSON.parse(e.target.response).downlink, (id) => {
                    outgoingmessage.play();
                    
                    document.getElementById(tempId).classList.add('delevered');
                    document.getElementById(tempId).dataset.downloaded = 'true';
                    
                    if (elem){
                        elem.querySelector('.sendingImage').remove();
                        elem.querySelector('.image').style.filter = 'none';
                    }
                    document.getElementById(tempId).id = id;
                });
            }
            else{
                console.log('error uploading image');
                elem.querySelector('.sendingImage').textContent = 'Error';
                fileSocket.emit('fileUploadError', myKey, tempId, 'image');
            }
        }
        xhr.send(formData);
    }
}

function sendFileStoreRequest(){
    let tempId = makeId();
    scrolling = false;
    insertNewMessage(selectedFile.data, 'file', tempId, myId, {data: finalTarget?.message, type: finalTarget?.type}, finalTarget?.id, {reply: (finalTarget.message ? true : false), title: (finalTarget.message || maxUser > 2 ? true : false)}, {ext: selectedFile.ext, size: selectedFile.size, name: selectedFile.name});

    let progress = 0;
    let elem = document.getElementById(tempId)?.querySelector('.messageMain');

    fileSocket.emit('fileUploadStart', 'file', '', tempId, myId, {data: finalTarget?.message, type: finalTarget?.type}, finalTarget?.id, {reply: (finalTarget.message ? true : false), title: (finalTarget.message || maxUser > 2 ? true : false)}, {ext: selectedFile.ext, size: selectedFile.size, name: selectedFile.name}, myKey);
    //document.getElementById(tempId).querySelector('.messageMain').style.filter = 'brightness(0.4)';
    
    let file = base64ToFile(selectedFile.data, selectedFile.name);
    
    let formData = new FormData();
    formData.append('file', file);
    formData.append('key', myKey);

    clearFinalTarget();
    //upload image via xhr request
    let xhr = new XMLHttpRequest();
    //send file via xhr post request
    xhr.open('POST', location.origin + '/api/files', true);
    xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
            progress = (e.loaded / e.total) * 100;
            elem.querySelector('.progress').textContent = '↑ ' + Math.round(progress) + '%';
        }
    };

    xhr.onload = function(e) {

        if (this.status == 200) {
            //fileSocket.emit('fileUploadEnd', tempId, myKey, JSON.parse(e.target.response).downlink, (id) => {
            fileSocket.emit('fileUploadEnd', tempId, myKey, JSON.parse(e.target.response).downlink, (id) => {
                outgoingmessage.play();
                document.getElementById(tempId).classList.add('delevered');
                document.getElementById(tempId).dataset.downloaded = 'true';
                elem.querySelector('.progress').style.visibility = 'hidden';
                document.getElementById(tempId).id = id;
            });
        }
        else{
            console.log('error uploading file');
            elem.querySelector('.progress').textContent = `Error`;
            fileSocket.emit('fileUploadError', myKey, tempId, 'image');
        }
    }
    xhr.send(formData);
}

function base64ToFile(base64, filename){
    let arr = base64.split(',');
    let mime = arr[0].match(/:(.*?);/)[1];
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename+'.qml');
}

//make a sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

document.querySelectorAll('.clickable').forEach(elem => {
    elem.addEventListener('click', () => {
        clickSound.currentTime = 0;
        clickSound.play();
    });
});


window.addEventListener('paste', (e) => {
        if (e.clipboardData) {
            let items = e.clipboardData.items;
            if (items) {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].kind === 'file') {
                        let file = items[i].getAsFile();
                        if (file.type.match('image.*')) {
                            //localStorage.setItem('selectedImage', file);
                            selectedImage.data = file;
                            selectedImage.ext = file.type.split('/')[1];
                            selectedFile.name = file.name;
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


//sockets

socket.on('connect', () => {
    const params = {
        name: myName,
        id: myId,
        avatar: myAvatar,
        key: myKey,
        maxuser: maxUser,
    }
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
        }
    });
});

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
        let html = `<li class="user" data-uid="${user.uid}"><img src="/images/avatars/${user.avatar}(custom).png" height="30px" width="30px"/>${user.uid == myId ? user.name + ' (You)' : user.name}</li>`;
        if (user.uid == myId){
            //document.getElementById('userlist').innerHTML = html + document.getElementById('userlist').innerHTML;
            const fragment = document.createRange().createContextualFragment(html);
            document.getElementById('userlist').prepend(fragment);
        }else{
            //document.getElementById('userlist').innerHTML += html;
            const fragment = document.createRange().createContextualFragment(html);
            document.getElementById('userlist').append(fragment);
        }
    });
});

socket.on('server_message', (message, type) => {
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
    serverMessage(message, type);
});

socket.on('newMessage', (message, type, id, uid, reply, replyId, options) => {
    if (type == 'text'){
        incommingmessage.play();
    }else if(type == 'sticker'){
        stickerSound.play();
    }
    insertNewMessage(message, type, id, uid, reply, replyId, options, {});
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

fileSocket.on('connect', () => {
    console.log('fileSocket connected');
    fileSocket.emit('join', myKey);
});

fileSocket.on('fileDownloadStart', (type, thumbnail, tempId, uId, reply, replyId, options, metadata) => {
    incommingmessage.play();
    //console.log('fileDownloadStart', type, thumbnail, tempId, uId, reply, replyId, options, metadata);
    fileBuffer.set(tempId, {type: type, data: '', uId: uId, reply: reply, replyId: replyId, options: options, metadata: metadata});
    if (type === 'image'){
        insertNewMessage(thumbnail, type, tempId, uId, reply, replyId, options, metadata);
        let elem = document.getElementById(tempId).querySelector('.messageMain');
        setTimeout(() => {
            elem.querySelector('.image').style.filter = 'brightness(0.4) url(#sharpBlur)';
        }, 20);
    }else{
        insertNewMessage('', type, tempId, uId, reply, replyId, options, metadata);
        let elem = document.getElementById(tempId).querySelector('.messageMain');
        elem.querySelector('.progress').textContent = `User sending...`;
    }
});

fileSocket.on('fileUploadError', (id, type) => {
    let element = document.getElementById(id).querySelector('.messageMain');
    let progressContainer;
    if (type === 'image'){
        progressContainer = element.querySelector('.sendingImage');
    }else{
        progressContainer = element.querySelector('.progress');
    }
    progressContainer.textContent = 'Upload Error';
});

fileSocket.on('fileDownloadReady', (tempId, id, downlink) => {
        
    if (!fileBuffer.has(tempId)){
        return;
    }

    let data = fileBuffer.get(tempId);
    let type = data.type;
    document.getElementById(tempId).id = id;
    let element = document.getElementById(id).querySelector('.messageMain');
    let progressContainer;
    if (type === 'image'){
        progressContainer = element.querySelector('.sendingImage');
    }else{
        progressContainer = element.querySelector('.progress');
    }

    fileBuffer.delete(tempId);

    let xhr = new XMLHttpRequest();
    xhr.open('GET', `${location.origin}/api/download/${downlink}`, true);
    xhr.responseType = 'blob'
    xhr.onprogress = async function(e) {
        if (e.lengthComputable && progressContainer) {
            let percentComplete = Math.round((e.loaded / e.total) * 100);
            progressContainer.textContent = `${percentComplete}%`;
        }
    }

    xhr.onload = function(e) {
        if (this.status == 200) {
            let file = this.response;

            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = function() {
        
                if (element){
                    let base64data = reader.result;
                    
                    clearDownload(element, base64data, type);
                   
                    fileSocket.emit('fileDownloaded', myId, myKey, downlink);
                    if (type === 'image'){
                        //update the reply thumbnails with the detailed image if exists
                        document.querySelectorAll(`.messageReply[data-repid="${id}"`)
                        .forEach(elem => {
                            elem.querySelector('.image').src = base64data;
                        });
                    }
                }
            }
        }else if (this.status == 404){
            console.log('404');
        }
    }
    xhr.send();
    updateScroll();
});

function clearDownload(element, base64data, type){
    outgoingmessage.play();
    if (type === 'image'){
       
        setTimeout(() => {
            element.querySelector('.sendingImage').remove();
            element.querySelector('.image').src = base64data;
            element.querySelector('.image').alt = 'image'
            element.querySelector('.image').style.filter = 'none';
        }, 20);
    }else if (type === 'file'){
        setTimeout(() => {
            element.querySelector('.file').dataset.data = base64data;
            element.querySelector('.progress').style.visibility = 'hidden';
        }, 20);
    }
    element.closest('.message').dataset.downloaded = 'true';
}

appHeight();

updateScroll();

setTimeout(() => {
    document.getElementById('preload').querySelector('.text').textContent = 'Slow internet';
}, 3000);
