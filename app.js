//enable strict mode
'use strict';
//console log in green color
log('%capp.js loaded', 'color: green');

const messages = document.getElementById('messages');

const emoji_regex = /^(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])+$/;

const maxWindowHeight = window.innerHeight;

const replyToast = document.getElementById('replyToast');

const lightboxClose = document.getElementById('lightbox__close');


const reactArray = ['💙', '😂','😮','😢','😠','👍🏻','👎🏻'];

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

let userList = [
    {uid: '1', name: 'John Doe', avatar: 'squirtle'},
    {uid: '2', name: 'Jane Doe', avatar: 'charmander'},
    {uid: '3', name: 'Jack Doe', avatar: 'bulbasaur'},
];

const myId = '1';
const myName = 'John Doe';
const maxUsers = 2;

function appHeight () {
    const doc = document.documentElement;
    doc.style.setProperty('--app-height', `${window.innerHeight}px`);
}

function getRandomTextFromWeb(){
    let string = 'Lorem ipsum dolor sit amet consectetur adipiscing elit eget rhoncus nullam vel, ullamcorper fringilla ultrices pharetra pretium venenatis condimentum volutpat libero.Viverra erat cursus facilisi vitae scelerisque placerat enim, curabitur dis montes malesuada id nascetur natoque, maecenas aptent efficitur nunc sapien purus.Vulputate ut a tristique venenatis eget euismod nisi egestas nulla leo dolor mi netus, ante ligula amet vestibulum adipiscing aenean proin velit dapibus scelerisque tellus.Sapien phasellus mollis himenaeos mauris sit rutrum magnis, nisi ultricies dis netus dictumst eget tempor, taciti nulla finibus morbi tincidunt torquent.Non torquent sollicitudin curae praesent pellentesque auctor montes, integer odio curabitur habitant semper in turpis, aliquet aliquam sociosqu dui tortor blandit.';
    //return random text from string
    return (string.substring(0, Math.round(Math.random() * string.length)));
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

function insertNewMessage(message, type, id, uid, reply, title, options){
    if (!options){
        options = {
            reply: false,
            title: false
        };
    }
    log(options);
    let template = document.getElementById('messageTemplate').innerHTML;
    let classList = '';
    let lastMsg = messages.querySelector('.message:last-child');
    if (type === 'text'){
        if(emo_test(message)){
            message = `<p class='text' style='background: none; font-size:30px; padding: 0;'>${message}</p>`;
        }else{
            message = `<p class='text'>${message}</p>`;
        }
    }else if(type === 'image'){
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
    if (!options.title || !classList.includes('start')){
        classList += ' notitle';
    }

    let html = Mustache.render(template, {
        classList: classList,
        avatar: `<img src='/images/avatars/${userList.find(user => user.uid == uid)?.avatar}(custom).png' width='30px' height='30px' alt='avatar' />`,
        messageId: id,
        uid: uid,
        title: title,
        message: message,
        replyMsg: reply,
        time: getCurrentTime()
    });
    log('Added new message');
    messages.innerHTML += html;
    updateScroll();
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

function emo_test(str) {
    return emoji_regex.test(str);
}

let copyOption = document.querySelector('.copyOption');
let downloadOption = document.querySelector('.downloadOption');
let deleteOption = document.querySelector('.deleteOption');

function showOptions(type, sender, target){
    document.querySelector('.reactorContainer').classList.remove('active');
    document.querySelectorAll(`#reactOptions div`).forEach(
        option => option.style.background = 'none'
    )
    if (type == 'text'){
        copyOption.style.display = 'flex';
    }else if (type == 'image'){
        downloadOption.style.display = 'flex';
    }
    if (sender){
        deleteOption.style.display = 'flex';
    }
    let clicked = target?.closest('.message')?.querySelector('.reactedUsers .list')?.dataset.uid == myId;
    console.log(clicked);
    if (clicked){
        let clickedElement = target?.closest('.message')?.querySelector(`.reactedUsers [data-uid="${myId}"]`)?.innerText;
        document.querySelector(`#reactOptions .${clickedElement}`).style.background = '#000000aa';
    }
    console.log(clicked);
    let options = document.getElementById('optionsContainer');
    options.classList.add('active');
    options.addEventListener('click', optionsMainEvent);
}

function optionsMainEvent(e){
    let target = e.target?.parentNode?.classList[0];
    if (target){
        switch (target){
            case 'copyOption':
                log('copy');
                clearTargetMessage();
                break;
            case 'downloadOption':
                log('download');
                clearTargetMessage();
                break;
            case 'deleteOption':
                log('delete');
                clearTargetMessage();
                break;
            case 'replyOption':
                log('reply');
                showReplyToast();
                break;
        }
        hideOptions();
    }
    optionsReactEvent(e);
}

function optionsReactEvent(e){
    log('Clicked on '+e.target.classList);
    let target = e.target?.classList[0];
    let messageId = targetMessage.id;

    if (target){
        if (reactArray.includes(target)){
            //e.target.style.background = '#00000073';
            getReact(target, messageId, myId, e.target);
            hideOptions();
            clearTargetMessage();
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
        map.set(element.innerText, map.get(element.innerText) + 1 || 1);
    });
    return map;
}

function getReact(type, messageId, uid){
    let target = document.getElementById(messageId).querySelector('.reactedUsers');
    let exists = target?.querySelector('.list') ?? false;
    if (exists){
        let list = target.querySelector('.list[data-uid="'+uid+'"]');
        if (list){
            if (list.innerText == type){
                list.remove();
            }else{
                list.innerText = type;
            }
        }else{
            target.innerHTML += `<div class='list' data-uid='${uid}'>${type}</div>`;
        }
        console.log(list);
    }
    else{
        target.innerHTML += `<div class='list' data-uid='${uid}'>${type}</div>`;
    }

    let map = new Map();
    let list = Array.from(target.querySelectorAll('.list'));
    map = arrayToMap(list);

    console.log(map);

    let reactsOfMessage = document.getElementById(messageId).querySelector('.reactsOfMessage');
    if (reactsOfMessage && map.size > 0){
        reactsOfMessage.innerHTML = '';
        let count = 0;
        map.forEach((value, key) => {
            if (count >= 2){
                console.log(count);
                reactsOfMessage.querySelector('span').remove();
            }
            reactsOfMessage.innerHTML += `<span>${key}${value}</span>`;
            count ++;
        });
        document.getElementById(messageId).classList.add('react');
    }else{
        document.getElementById(messageId).classList.remove('react');
    }
    updateScroll();
}




appHeight();

document.querySelector('.more').addEventListener('click', ()=>{
    insertNewMessage(getRandomTextFromWeb(), 'text', makeId, 2, '', 'Laam', {reply: false, title: (maxUsers > 2) || targetMessage.sender != '' ? true : false});
});

updateScroll();






class ClickAndHold{
    /**
     * @param {EventTarget} target The html elemnt to target
     * @param {TimeOut} timeOut The time out in milliseconds
     * @param {Function} callback The callback to call when the user clicks and holds
     */
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



//if user device is mobile
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (isMobile){
    ClickAndHold.applyTo(messages, 300, (evt)=>{
        //console.log('held');
        OptionEventHandler(evt);
    });
}


function clearTargetMessage(){
    targetMessage.sender = '';
    targetMessage.message = '';
    targetMessage.id = '';
}

function OptionEventHandler(evt){
    let type;
    let sender = evt.target?.closest('.message')?.classList?.contains('self')? true : false;
    if (evt.target?.classList.contains('text')){
        type = 'text';
        targetMessage.sender = evt.target?.closest('.message')?.querySelector('.messageTitle')?.innerText?.split(' ')?.shift();
        if (targetMessage.sender == myName){
            targetMessage.sender = 'You';
        }
        targetMessage.message = evt.target?.closest('.message')?.querySelector('.messageMain .text')?.textContent?.substring(0, 100);
        targetMessage.id = evt.target?.closest('.message')?.id;
    }
    else if (evt.target?.classList.contains('image')){
        type = 'image';
        targetMessage.sender = evt.target?.closest('.message')?.querySelector('.messageTitle')?.textContent?.split(' ')?.shift();
        targetMessage.message = 'Image';
        targetMessage.id = evt.target?.closest('.message')?.id;
    }
    if (type == 'text' || type == 'image'){
        showOptions(type, sender, evt.target);
    }
}


//make a mouse right click event
if(!isMobile){
    messages.addEventListener('contextmenu', (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        if (evt.which == 3){
            //console.log('right click');
            OptionEventHandler(evt);
        }
    });
}

messages.addEventListener('click', (evt) => {
  if (evt.target?.classList?.contains('image')){
    evt.preventDefault();
    evt.stopPropagation();
    document.getElementById('lightbox__image').innerHTML = `<img src=${evt.target?.src} class='lb'>`;
    log('click on image');
    document.getElementById('lightbox').classList.add('active');
  }
  else if (evt.target?.classList?.contains('reactsOfMessage') || evt.target?.parentNode?.classList?.contains('reactsOfMessage')){
      let target = evt.target?.closest('.message')?.querySelectorAll('.reactedUsers .list');
      console.log(target);
      let container = document.querySelector('.reactorContainer ul');
      container.innerHTML = '';
      if (target.length > 0){
        target.forEach(element => {
            let avatar = userList.find(user => user.uid == element.dataset.uid).avatar;
            console.log(avatar);
            if (element.dataset.uid == myId){
                container.innerHTML = `<li><img src='/images/avatars/${avatar}(custom).png' height='30px' width='30px'><span class='uname'>${element.dataset.uid}</span><span class='r'>${element.innerText}</span></li>` + container.innerHTML;
            }else{
                container.innerHTML += `<li><img src='/images/avatars/${avatar}(custom).png' height='30px' width='30px'><span class='uname'>${element.dataset.uid}</span><span class='r'>${element.innerText}</span></li>`;
            }
        });
      }
      hideOptions();
      document.querySelector('.reactorContainer').classList.add('active');
  }
  else{
    hideOptions();
  }
});


lightboxClose.addEventListener('click', () => {
    document.getElementById('lightbox').classList.remove('active');
    document.getElementById('lightbox__image').innerHTML = '';
});


textbox.addEventListener('focus', function () {
    updateScroll();
});

let softKeyIsUp = false;
let scrolling = false;

textbox.addEventListener('blur', ()=>{
  if (softKeyIsUp){
    //$('#textbox').trigger('focus');
    textbox.focus();
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

document.querySelector('.closeOption').addEventListener('click', () => {
    clearTargetMessage();
    hideOptions();
});

replyToast.querySelector('.close').addEventListener('click', ()=>{
  hideReplyToast();
});

document.addEventListener('contextmenu', event => event.preventDefault());


const sendButton = document.getElementById('send');
const photoButton = document.getElementById('photo');

sendButton.addEventListener('click', () => {
    log('send');
    let message = textbox.value?.trim();
    textbox.value = '';
    if (message.length > 10000) {
        text = text.substring(0, 10000);
        text += '... (message too long)';
    }
    //replace spaces with unusual characters
    message?.replace(/\n/g, '¶')?.replace(/>/gi, "&gt;")?.replace(/</gi, "&lt;");
    message?.replace(/¶/g, '<br/>');
    resizeTextbox();
    if (message.length) {insertNewMessage(message, 'text', makeId(), myId, finalTarget?.message, finalTarget?.sender ? `You replied to ${finalTarget.sender}` : 'Fuad', {reply: (finalTarget.message ? true : false), title: (finalTarget.message ? true : false)});}
    textbox.focus();
    hideOptions();
    hideReplyToast();
});


photoButton.addEventListener('change', ()=>{
    document.getElementById('selectedImage').innerHTML = `Loading image <i class="fa-solid fa-circle-notch fa-spin"></i>`;
    let file = photoButton.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
        let data = e.target.result;
        document.getElementById('selectedImage').innerHTML = `<img src="${data}" alt="image" class="image-message" />`;
    }
    document.getElementById('previewImage')?.classList?.add('active');
});


document.getElementById('previewImage').querySelector('.close')?.addEventListener('click', ()=>{
    document.getElementById('previewImage')?.classList?.remove('active');
    document.getElementById('selectedImage').innerHTML = '';
});

document.getElementById('previewImage').querySelector('#imageSend')?.addEventListener('click', ()=>{
    let message = document.getElementById('selectedImage').querySelector('img')?.src;
    insertNewMessage(message, 'image', makeId(), 1234, targetMessage?.message, targetMessage?.sender ? `You replied to ${targetMessage.sender}` : 'Fuad', {reply: (targetMessage.message ? true : false), title: (targetMessage.message ? true : false)});
    document.getElementById('previewImage')?.classList?.remove('active');
    document.getElementById('selectedImage').innerHTML = '';
});


textbox.addEventListener('keydown', (evt) => {
    if (evt.ctrlKey && (evt.key === 'Enter')) {
      //$('.send').trigger('click');
      sendButton.click();
    }
});