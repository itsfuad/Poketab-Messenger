"use strict";

maxuser.addEventListener('input', ()=>{
    //$('#rangeValue').text($('#maxuser').val());
    document.getElementById('rangeValue').textContent = maxuser.value;
});

nextbtn.addEventListener('click', nextbtnEvent);

function nextbtnEvent(e){
    e.preventDefault();
    if (validateKey()){   
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
        document.getElementById('label').style.color = '#fff';
        document.getElementById('label').innerHTML = 'Checking <i class="fa-solid fa-circle-notch fa-spin"></i>';
    }
}

document.querySelector('.copy').addEventListener('click', ()=>{
    let key = document.getElementById('key').value;
    navigator.clipboard.writeText(`${location.origin}/login/${key}`);
    document.getElementById('label').style.color = 'limegreen';
    document.getElementById('label').innerHTML = 'Copied <i class="fa-solid fa-clipboard-check"></i>';
    setTimeout(()=>{
        document.getElementById('label').style.color = '#fff';
        document.getElementById('label').innerHTML = 'Tap to copy <i class="fa-regular fa-clone"></i>';
    }, 1000);

});

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

new QRious({
    element: document.getElementById("qrcode"),
    background: '#fff',
    foreground: '#000',
    size: 125,
    value: `${location.origin}/login/${document.getElementById('key').value}`
});