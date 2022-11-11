//parent port
const { parentPort, workerData } = require('worker_threads');

function messageFilter(message){
    message = censorBadWords(message); //check if the message contains bad words
    message = linkify(message); //if the message contains links then linkify the message
    message = message.replaceAll(/```¶/g, '```'); //replace the code block markers
    message = message.replaceAll(/```([^`]+)```/g, '<code>$1</code>'); //if the message contains code then replace it with the code tag
    message = message.replaceAll('¶', '<br>'); //if the message contains new lines then replace them with <br>
    return message;
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

let message = messageFilter(workerData.message);

parentPort.postMessage(message);