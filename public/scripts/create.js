const socket = io();

let e_users = [], e_avatars = [];

maxuser.addEventListener('input', ()=>{
    //$('#rangeValue').text($('#maxuser').val());
    document.getElementById('rangeValue').innerText = maxuser.value;
});

nextbtn.addEventListener('click', nextbtnEvent);

enter.addEventListener('click', function(e){
    e.preventDefault();
    document.querySelectorAll('.errLog')
    .forEach(elem => {
        elem.innerText = '';
    });
    if (validateKey() && validateUser()){
        let username = document.getElementById('username').value;
        let avatar = document.querySelector('input[name="avatar"]:checked').value;
        let key = document.getElementById('key').value;
        let maxuser = document.getElementById('maxuser').value;
        let xhr = new XMLHttpRequest();
        xhr.open('POST', '/chat');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            username: username,
            avatar: avatar,
            key: key,
            maxuser: maxuser
        }));
        enter.innerHTML = 'Please wait <i class="fa-solid fa-circle-notch fa-spin"></i>';
    }
});

function nextbtnEvent(e){
    e.preventDefault();
    document.querySelectorAll('.errLog')
    .forEach(elem => {
        elem.innerText = '';
    });
    if (validateKey()){   
        console.log('validateKey');
        socket.emit('createRequest', key, function(err){
            if (err){
                document.getElementById('label').innerHTML = 'Chat Key <i class="fa-solid fa-key"></i>';
                errlog('keyErr', `${err} <i class="fa-solid fa-triangle-exclamation" style="color: orange;"></i>`);
                nextbtn.innerHTML = 'Reload <i class="fa-solid fa-arrows-rotate"></i>';
                nextbtn.removeEventListener('click', nextbtnEvent);
                nextbtn.addEventListener('click', ()=>{
                    location.reload();
                });
            }
        });
        document.getElementById('label').innerHTML = 'Checking <i class="fa-solid fa-circle-notch fa-spin"></i>';
    }
    console.log('next');
}

socket.on('createResponse', (data) => {
    document.getElementById('label').innerHTML = 'Chat Key <i class="fa-solid fa-key"></i>';
    if (!data.exists){
        form1.style.display = 'none';
        form2.classList.add('active');
        howto.style.display = 'none';
    }else{
        errlog('keyErr', 'Key does already exists <i class="fa-solid fa-triangle-exclamation" style="color: orange;"></i>');
    }
})