const buttons = document.querySelectorAll('.btn-animate');

buttons.forEach((button) => {
	button.addEventListener('click', () => {
		button.classList.add('clicked');
		setTimeout(() => {
			button.classList.remove('clicked');
		}, 150);
	});
});
