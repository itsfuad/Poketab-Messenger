//enable strict mode
'use strict';

//bundles

import {io} from 'socket.io-client';
import Mustache from 'mustache';

console.log('loaded');

//variables
const socket = io();
const messages = document.getElementById('messages');
//const emoji_regex = /^(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])+$/;
const maxWindowHeight = window.innerHeight;
const replyToast = document.getElementById('replyToast');
const lightboxClose = document.getElementById('lightbox__close');
const textbox = document.getElementById('textbox');
const options = document.querySelector('.options');
const closeOption = document.querySelector('.closeOption');
const copyOption = document.querySelector('.copyOption');
const downloadOption = document.querySelector('.downloadOption');
const deleteOption = document.querySelector('.deleteOption');
const replyOption = document.querySelector('.replyOption');

const incommingmessage = new Audio('/sounds/incommingmessage.mp3');
const outgoingmessage = new Audio('/sounds/outgoingmessage.mp3');
const joinsound = new Audio('/sounds/join.mp3');
const leavesound = new Audio('/sounds/leave.mp3');
const typingsound = new Audio('/sounds/typing.mp3');
const locationsound = new Audio('/sounds/location.mp3');
const reactsound = new Audio('/sounds/react.mp3');
const clickSound = new Audio('/sounds/click.mp3');

const sendButton = document.getElementById('send');
const photoButton = document.getElementById('photo');


let isTyping = false, timeout = undefined;

const reactArray = ['💙', '😂','😮','😢','😠','👍🏻','👎🏻'];
const userMap = new Map();

let softKeyIsUp = false;
let scrolling = false;
let lastPageLength = messages.scrollTop;
let scroll = 0;

let targetMessage = {
    sender: '',
    message: '',
    id: '',
};

let finalTarget = {
    sender: '',
    message: '',
    id: '',
};

const userInfoMap = new Map();

//first load functions 
//if user device is mobile
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

//class
class ClickAndHold{
    constructor(target, timeOut, callback){
        this.target = target;
        this.callback = callback;
        this.isHeld = false;
        this.activeHoldTimeoutId = null;
        this.timeOut = timeOut;
        ["touchstart", "mousedown"].forEach(eventName => {
          try{
            this.target.addEventListener(eventName, this._onHoldStart.bind(this));
          }
          catch(e){
            console.log(e);
          }
        });
        ["touchmove", "mousemove"].forEach(eventName => {
          try{
            this.target.addEventListener(eventName, this._onHoldMove.bind(this));
          }
          catch(e){
            console.log(e);
          }
        });
        ["mouseup", "touchend", "mouseleave", "mouseout", "touchcancel"].forEach(eventName => {
          try{
            this.target.addEventListener(eventName, this._onHoldEnd.bind(this));
          }
          catch(e){
            console.log(e);
          }
        });
    }
    _onHoldStart(evt){
        this.isHeld = true;
        this.activeHoldTimeoutId = setTimeout(() => {
            if (this.isHeld) {
                this.callback(evt);
            }
        }, this.timeOut);
    }
    _onHoldMove(){
        this.isHeld = false;
    }
    _onHoldEnd(){
        this.isHeld = false;
        clearTimeout(this.activeHoldTimeoutId);
    }
    static applyTo(target, timeOut, callback){
      try{
        new ClickAndHold(target, timeOut, callback);
      }
      catch(e){
        console.log(e);
      }
    }
}

if (isMobile){
    ClickAndHold.applyTo(messages, 300, (evt)=>{
        let isDeleted = evt.target.closest('.message').dataset.deleted == 'true' ? true : false;
        if (!isDeleted){
            OptionEventHandler(evt);
        }
    });
}

//make a mouse right click event
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

function appHeight () {
    const doc = document.documentElement;
    doc.style.setProperty('--app-height', `${window.innerHeight}px`);
}

function makeId(length = 10){
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++){
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function insertNewMessage(message, type, id, uid, reply, replyId, options){
    if (!options){
        options = {
            reply: false,
            title: false
        };
    }

    let template = document.getElementById('messageTemplate').innerHTML;
    let classList = '';
    let lastMsg = messages.querySelector('.message:last-child');
    let popupmsg = '';
    if (type === 'text'){
        popupmsg = message.length > 20 ? `${message.substring(0, 20)} ...` : message;
        if(isEmoji(message)){
            message = `<p class='text' style='background: none; font-size:30px; padding: 0;'>${message}</p>`;
        }else{
            message = censorBadWords(message);
            message = `<p class='text'>${linkify(message)}</p>`;
        }
    }else if(type === 'image'){
        popupmsg = 'Image';
        message = `<img class='image' src='${message}' alt='image' />`;
    }else{
        throw new Error('Unknown message type');
    }

    if(uid == myId){
        classList += ' self';
    }

    if (lastMsg?.dataset?.uid != uid){
        classList += ' start end';
    }else  if (lastMsg?.dataset?.uid == uid){
        if (!options.reply){
            lastMsg?.classList.remove('end');
        }else{
            classList += ' start';
        }
        classList += ' end';
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
    //let username = userList.find(user => user.uid === uid)?.name;
    let username = userInfoMap.get(uid)?.name;
    //let avatar = userList.find(user => user.uid === uid)?.avatar;
    let avatar = userInfoMap.get(uid)?.avatar;
    
    if (username == myName){username = 'You';}
    //let repliedTo = userList.find(user => user.uid == document.getElementById(replyId)?.dataset?.uid)?.name;
    let repliedTo = userInfoMap.get(document.getElementById(replyId)?.dataset?.uid)?.name;
    if (repliedTo == myName){repliedTo = 'You';}
    if (repliedTo == username){repliedTo = 'self';}
    
    let html = Mustache.render(template, {
        classList: classList,
        avatar: `<img src='/images/avatars/${avatar}(custom).png' width='30px' height='30px' alt='avatar' />`,
        messageId: id,
        uid: uid,
        repId: replyId,
        title: options.reply? `${username} replied to ${repliedTo}` : username,
        message: message,
        replyMsg: reply,
        time: getCurrentTime()
    });
    /*
    messages.innerHTML += html;
    */
    const fragment = document.createDocumentFragment();
    fragment.append(document.createRange().createContextualFragment(html));
    messages.append(fragment);
    //updateScroll(userList.find(user => user.uid === uid)?.avatar, popupmsg);
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

/*
function emo_test(str) {
    return emoji_regex.test(str);
}
*/

function isEmoji(text) {
    return /^([\uD800-\uDBFF][\uDC00-\uDFFF])*$/.test(text);   
}

function showOptions(type, sender, target){
    vibrate();
    //console.log(type, sender, target);
    document.querySelector('.reactorContainer').classList.remove('active');
    document.querySelectorAll(`#reactOptions div`).forEach(
        option => option.style.background = 'none'
    )
    
    if (type == 'text'){
        copyOption.style.display = 'flex';
    }else if (type == 'image'){
        downloadOption.style.display = 'flex';
    }
    if (sender == true){
        deleteOption.style.display = 'flex';
    }else{
        deleteOption.style.display = 'none';
    }
    //let clicked = target?.closest('.message')?.querySelectorAll('.reactedUsers .list')?.dataset.uid == myId;
    let clicked = Array.from(target?.closest('.message')?.querySelectorAll('.reactedUsers .list')).reduce((acc, curr) => {
        return acc || curr.dataset.uid == myId;
    }, false);
    if (clicked){
        let clickedElement = target?.closest('.message')?.querySelector(`.reactedUsers [data-uid="${myId}"]`)?.textContent;
        document.querySelector(`#reactOptions .${clickedElement}`).style.background = '#000000aa';
    }
   
    let options = document.getElementById('optionsContainer');
    options.classList.add('active');
    options.addEventListener('click', optionsMainEvent);
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
    if (message){
        //message.querySelector('.messageMain').innerHTML = '<p>Deleted message</p>';
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
            element.style.background = '#000000c4';
            element.style.color = '#7d858c';
            element.textContent = `${user == myName ? 'You': user} deleted this message`;
          });
        }
    }
}

function saveImage()
{
  try{
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

function optionsReactEvent(e){
    let target = e.target?.classList[0];
    let messageId = targetMessage.id;
    if (target){
        if (reactArray.includes(target)){
            //e.target.style.background = '#00000073';
            //getReact(target, messageId, myId, e.target);
            socket.emit('react', target, messageId, myId);
            hideOptions();
        }
    }
}

function hideOptions(){
    let options = document.getElementById('optionsContainer');
    options.classList.remove('active');
    setTimeout(() => {
        copyOption.style.display = 'none';
        downloadOption.style.display = 'none';
        deleteOption.style.display = 'none';
    }, 100);
    document.querySelector('.reactorContainer').classList.remove('active');
    options.removeEventListener('click', optionsMainEvent);
}


function showReplyToast(){
    hideOptions();
    updateScroll();
    textbox.focus();

    finalTarget = Object.assign({}, targetMessage);
    replyToast.querySelector('.replyText').textContent = finalTarget.message?.substring(0, 50);
    replyToast.querySelector('#text').textContent = finalTarget.sender;
    replyToast.classList.add('active');
}

function hideReplyToast(){
    replyToast.classList.remove('active');
    replyToast.querySelector('.replyText').textContent = '';
    replyToast.querySelector('#text').textContent = '';
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
                count ++;
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
    targetMessage.id = '';
}

function OptionEventHandler(evt){
    let type;
    let sender = evt.target.closest('.message').classList.contains('self')? true : false;
    if (evt.target.classList.contains('text')){
        type = 'text';
        //targetMessage.sender = userList.find(user => user.uid == evt.target.closest('.message')?.dataset?.uid).name;
        targetMessage.sender = userInfoMap.get(evt.target.closest('.message')?.dataset?.uid).name;
        if (targetMessage.sender == myName){
            targetMessage.sender = 'You';
        }
        targetMessage.message = evt.target.closest('.message').querySelector('.messageMain .text').textContent.substring(0, 100);
        targetMessage.id = evt.target?.closest('.message')?.id;
    }
    else if (evt.target.classList.contains('image')){
        type = 'image';
        //document.querySelector('#lightbox__image').innerHTML = "";
        while (document.querySelector('#lightbox__image').firstChild) {
            document.querySelector('#lightbox__image').removeChild(document.querySelector('#lightbox__image').firstChild);
        }
        //document.querySelector('#lightbox__image').innerHTML = `<img src="${evt.target.closest('.message').querySelector('.image').src}" alt="Image">`;
        const fragment = document.createDocumentFragment();
        const img = document.createElement('img');
        img.src = evt.target.closest('.message').querySelector('.image').src;
        img.alt = 'Image';
        fragment.append(img);
        document.querySelector('#lightbox__image').append(fragment);
        //targetMessage.sender = userList.find(user => user.uid == evt.target.closest('.message')?.dataset?.uid).name;
        targetMessage.sender = userInfoMap.get(evt.target.closest('.message')?.dataset?.uid).name;
        if (targetMessage.sender == myName){
            targetMessage.sender = 'You';
        }
        targetMessage.message = 'Image';
        targetMessage.id = evt.target?.closest('.message')?.id;
    }
    if (type == 'text' || type == 'image'){
        showOptions(type, sender, evt.target);
    }
}


function updateScroll(avatar = null, text = ''){
    if (scrolling) {
        if (text.length > 0 && avatar != null) {
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
    }, 100);
}


function removeNewMessagePopup() {
    document.querySelector('.newmessagepopup').classList.remove('active');
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


function getTypingString(userMap){
    const array = Array.from(userMap.values());
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


function resizeImage(img, mimetype) {
    let canvas = document.createElement('canvas');
    let width = img.width;
    let height = img.height;
    let max_height = 480;
    let max_width = 480;
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
    return canvas.toDataURL(mimetype, 0.7); 
}
  
function linkify(inputText) {
let replacedText, replacePattern1, replacePattern2, replacePattern3;
replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');
replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');
replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');
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
        navigator.vibrate([0, 250, 250, 250]);
    }
}

//Event listeners


document.getElementById('more').addEventListener('click', ()=>{
    document.getElementById('sidebar').classList.add('active');
});

document.getElementById('keyname').addEventListener('click', ()=>{
    copyText(document.getElementById('keyname').textContent);
});


messages.addEventListener('scroll', () => {
    scroll = messages.scrollTop;
    let scrolled = lastPageLength-scroll;
    if (scroll <= lastPageLength) {
      if (scrolled >= 50){   
        scrolling = true;
      }
      if (scrolled == 0){
        scrolling = false;
      }
    } 
    else {
      lastPageLength = scroll;
      removeNewMessagePopup();
      scrolling = false;
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

closeOption.addEventListener('click', () => {
    options.classList.remove('active');
});


document.querySelector('.closeOption').addEventListener('click', () => {
    clearTargetMessage();
    hideOptions();
});

replyToast.querySelector('.close').addEventListener('click', ()=>{
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

document.querySelector('.chatBox').addEventListener('click', (evt) => {
    try{
        if (evt.target?.id != 'more' && !evt.target.classList.contains('fa-ellipsis-vertical')){
            document.getElementById('sidebar').classList.remove('active');
        }
    }catch(e){
        console.log(e);
    }
});

messages.addEventListener('click', (evt) => {
    try {
        if (evt.target?.classList?.contains('image')){
            evt.preventDefault();
            evt.stopPropagation();
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
            document.querySelector('.reactorContainer').classList.add('active');
        }
        else if (evt.target?.classList?.contains('messageReply')){
            if (document.getElementById(evt.target.dataset.repid).dataset.deleted != 'true'){
                try{
                    let target = evt.target.dataset.repid;
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
                        document.getElementById(target).scrollIntoView({behavior: 'smooth', block: 'center'});
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
        console.log("Message does not exist");
    }
});

window.addEventListener('resize',()=>{
  appHeight();
  let temp = scrolling;
  setTimeout(()=>{
    scrolling = false;
    updateScroll();
  }, 100);
  scrolling = temp;
  softKeyIsUp = maxWindowHeight > window.innerHeight ? true : false;
});

replyOption.addEventListener('click', showReplyToast);
copyOption.addEventListener('click', () => {
    copyText(null);
});
downloadOption.addEventListener('click', saveImage);
deleteOption.addEventListener('click', ()=>{
    let uid = document.getElementById(targetMessage.id)?.dataset?.uid;
    if (uid){
        socket.emit('deletemessage', targetMessage.id, uid, myName, myId);
    }
});

photoButton.addEventListener('change', ()=>{
    //document.getElementById('selectedImage').innerHTML = `Loading image <i class="fa-solid fa-circle-notch fa-spin"></i>`;
    while (document.getElementById('selectedImage').firstChild) {
        document.getElementById('selectedImage').removeChild(document.getElementById('selectedImage').firstChild);
    }
    const fragment = document.createRange().createContextualFragment(`Loading image&nbsp;<i class="fa-solid fa-circle-notch fa-spin"></i>`);
    document.getElementById('selectedImage').append(fragment);
    let file = photoButton.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
        let data = e.target.result;
        //document.getElementById('selectedImage').innerHTML = `<img src="${data}" alt="image" class="image-message" />`;
        while (document.getElementById('selectedImage').firstChild) {
            document.getElementById('selectedImage').removeChild(document.getElementById('selectedImage').firstChild);
        }
        const fragment = document.createRange().createContextualFragment(`<img src="${data}" alt="image" class="image-message" />`);
        document.getElementById('selectedImage').append(fragment);
    }
    document.getElementById('previewImage')?.classList?.add('active');
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
    if (message.length > 10000) {
        message = message.substring(0, 10000);
        message += '... (message too long)';
    }
    //replace spaces with unusual characters
    message = message.replace(/\n/g, '¶');
    message = message.replace(/>/g, '&gt;');
    message = message.replace(/</g, '&lt;');
    message = message.replace(/¶/g, '<br/>');
    resizeTextbox();
    if (message.length) {
        let tempId = makeId();
        scrolling = false;
        insertNewMessage(message, 'text', tempId, myId, finalTarget?.message, finalTarget?.id, {reply: (finalTarget.message ? true : false), title: (finalTarget.message || maxUser > 2 ? true : false)});
        socket.emit('message', message, 'text', tempId, myId, finalTarget?.message, finalTarget?.id, {reply: (finalTarget.message ? true : false), title: (finalTarget.message || maxUser > 2 ? true : false)});
    }
    finalTarget.message = '';
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
    document.getElementById('previewImage')?.classList?.remove('active');
    //document.getElementById('selectedImage').innerHTML = '';
    while (document.getElementById('selectedImage').firstChild) {
        document.getElementById('selectedImage').removeChild(document.getElementById('selectedImage').firstChild);
    }
});

document.getElementById('previewImage').querySelector('#imageSend')?.addEventListener('click', ()=>{
    let file = photoButton.files[0];
    let reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function(e){
        let blob = new Blob([e.target.result]);
        window.URL = window.URL || window.webkitURL;
        let blobURL = window.URL.createObjectURL(blob);
        let image = new Image();
        image.src = blobURL;
        image.onload = function() {
            let resized = resizeImage(image, file.mimetype);
            let tempId = makeId();
            scrolling = false;
            insertNewMessage(resized, 'image', tempId, myId, finalTarget?.message, finalTarget?.id, {reply: (finalTarget.message ? true : false), title: (finalTarget.message ? true : false)});
            socket.emit('message', resized, 'image', tempId, myId, finalTarget?.message, finalTarget?.id, {reply: (finalTarget.message ? true : false), title: (finalTarget.message ? true : false)});
            document.getElementById('previewImage')?.classList?.remove('active');
            //document.getElementById('selectedImage').innerHTML = '';
            while (document.getElementById('selectedImage').firstChild) {
                document.getElementById('selectedImage').removeChild(document.getElementById('selectedImage').firstChild);
            }
        }
    }
});


document.getElementById('lightbox__save').addEventListener('click', ()=>{
    saveImage();
});


textbox.addEventListener('keydown', (evt) => {
    if (evt.ctrlKey && (evt.key === 'Enter')) {
      sendButton.click();
    }
});

document.getElementById('send-location').addEventListener('click', () => {
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
        popupMessage('Unable to fetch location.');
    });
});

document.querySelectorAll('.clickable').forEach(elem => {
    elem.addEventListener('click', () => {
        clickSound.currentTime = 0;
        clickSound.play();
    });
});



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
            if (userMap.size > 0){
                document.getElementById('typingIndicator').textContent = getTypingString(userMap);
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
    incommingmessage.play();
    insertNewMessage(message, type, id, uid, reply, replyId, options);
});

socket.on('messageSent', (messageId, id) => {
    outgoingmessage.play();
    document.getElementById(messageId).classList.add('delevered');
    document.getElementById(messageId).id = id;
});

socket.on('getReact', (target, messageId, myId) => {
    getReact(target, messageId, myId);
});

socket.on('deleteMessage', (messageId, userName) => {
    deleteMessage(messageId, userName);
});

socket.on('typing', (user, id) => {
    typingsound.play();
    userMap.set(id, user);
    document.getElementById('typingIndicator').textContent = getTypingString(userMap);
  });
  
socket.on('stoptyping', (id) => {
    userMap.delete(id);
    if (userMap.size == 0) {
        document.getElementById('typingIndicator').textContent = '';
    }else{
        document.getElementById('typingIndicator').textContent = getTypingString(userMap);
    }
});


//on disconnect
socket.on('disconnect', () => {
    console.log('disconnected');
    popupMessage('Disconnected from server');
});


appHeight();

updateScroll();

setTimeout(() => {
    document.getElementById('preload').querySelector('.text').textContent = 'Slow internet';
}, 3000);
