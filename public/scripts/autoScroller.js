log('%cAutoScroller.js Loaded', 'color: orangered');


function updateScroll(){
    setTimeout(() => {
        let messages = document.getElementById('messages');
        messages.scrollTo(0, messages.scrollHeight);
    }, 100);
}