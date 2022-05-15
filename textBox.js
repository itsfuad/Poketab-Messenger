log('TextBox.js loaded');

const textbox = document.getElementById('textbox');

let isTyping = false, timeout = undefined;

function typingStatus(){
    if (timeout) {
        clearTimeout(timeout);
        timeout = undefined;
    }
    if (!isTyping) {
        isTyping = true;
        //socket.emit('typing');
        log('typing');
        document.getElementById('typingIndicator').textContent = 'typing...';
    }
    timeout = setTimeout(function () {
        isTyping = false;
        //socket.emit('stoptyping');
        log('stoptyping');
        document.getElementById('typingIndicator').textContent = '';

    }, 1000);
}

function resizeTextbox(){
    textbox.style.height = 'auto';
    textbox.style.height = textbox.scrollHeight + 'px';
}

textbox.addEventListener('input' , function () {
    resizeTextbox();
    //isTyping = true;
    typingStatus();
});

