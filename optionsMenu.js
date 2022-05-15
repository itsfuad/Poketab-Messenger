let options = document.querySelector('.options');

let closeOption = document.querySelector('.closeOption');

closeOption.addEventListener('click', () => {
    options.classList.remove('active');
});