document.addEventListener('click', (evt) => {
	const elem = evt.target.closest('.btn-animate');
	if (elem) {
		elem.classList.add('clicked');
		setTimeout(() => {
			elem.classList.remove('clicked');
		}, 150);
	}
});