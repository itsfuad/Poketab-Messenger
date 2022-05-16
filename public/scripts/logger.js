console.log('%cLogger.js loaded', 'color: purple');

const dev = true;

function log(text){
    if(dev){
        console.dir(text);
    }
}