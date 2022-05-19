"use strict";

nextbtn.addEventListener('click', nextbtnEvent);

function nextbtnEvent(e){
    e.preventDefault();
    document.querySelectorAll('.errLog')
    .forEach(elem => {
        elem.innerText = '';
    });
    if (validateKey()){   
        let key = document.getElementById('key').value;
        socket.emit('joinRequest', key, function(err){
            if (err){
                document.open();
                document.write(err);
                document.close();
            }
        });
        document.getElementById('label').innerHTML = 'Checking <i class="fa-solid fa-circle-notch fa-spin"></i>';
    }
}


socket.on('joinResponse', (data) => {
    document.getElementById('label').innerHTML = 'Chat Key <i class="fa-solid fa-key"></i>';
    if (!data.exists){
        errlog('keyErr', 'Key does not exists <i class="fa-solid fa-ghost" style="color: whitesmoke;"></i>');
    }else{
        e_users = data.userlist;
        e_avatars = data.avatarlist;
        if (e_avatars){
            e_avatars.forEach(avatar => {
                //* delete if works
                document.querySelector(`label[for='${avatar}']`).style.display = 'none';
            });
        }
        form1.style.display = 'none';
        form2.classList.add('active');
        howto.style.display = 'none';
    }
})