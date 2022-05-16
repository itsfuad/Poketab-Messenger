socket.on('joinResponse', (data) => {
    document.getElementById('label').innerHTML = 'Chat Key <i class="fa-solid fa-key"></i>';
    if (data.exists){
        errlog('keyErr', '*Key already exists');
    }else{
        e_users = data.users;
        e_avatars = data.avatars;
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