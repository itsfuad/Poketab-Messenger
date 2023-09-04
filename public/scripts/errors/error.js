console.log('Error.js loaded');

document.addEventListener('click', evt => {
	const elem = evt.target.closest('.btn');
	if (elem){
		document.querySelector('.preload').classList.add('active');
		//console.log(evt.target);
		if (elem.classList.contains('button-animate')){
			elem.classList.add('buttonPressed');
			setTimeout(() => {
				elem.classList.remove('buttonPressed');
			}, 100);
		}
	}
});