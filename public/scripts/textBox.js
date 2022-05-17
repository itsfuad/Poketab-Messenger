log('TextBox.js loaded');

const textbox = document.getElementById('textbox');

let isTyping = false, timeout = undefined;


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
        log('typing');
    }
    timeout = setTimeout(function () {
        isTyping = false;
        socket.emit('stoptyping');
        log('stoptyping');
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

