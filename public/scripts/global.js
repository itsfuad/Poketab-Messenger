console.log('%cButton Inspector loaded!', 'color: #00ff00; font-weight: bold;');

document.addEventListener('mousedown', evt => {
	const elem = evt.target.closest('.button-observe');
	console.log(evt.target);
	if (elem){
		elem.classList.add('buttonPressed');
	}
});

document.addEventListener('mouseup', () => {
	const targets = document.querySelectorAll('.button-observe');
	targets.forEach(target => {
		target.classList.remove('buttonPressed');
	});
});