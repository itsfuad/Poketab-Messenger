"use strict";

maxuser.addEventListener('input', ()=>{
    //$('#rangeValue').text($('#maxuser').val());
    document.getElementById('rangeValue').innerText = maxuser.value;
});

nextbtn.addEventListener('click', nextbtnEvent);

function nextbtnEvent(e){
    e.preventDefault();
    if (validateKey()){   
        console.log('validateKey');
        let key = document.getElementById('key').value;
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