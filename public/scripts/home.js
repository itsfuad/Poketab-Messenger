//enable strict mode
'use strict';

document.addEventListener('touchmove', evt => {
	animate(evt.touches[0]);
});
document.addEventListener('mousemove', evt => {
	animate(evt);
});

function animate(evt){
	const x = evt.clientX;
	const y = evt.clientY;

	const anchor = document.getElementById('logo');
	const rect = anchor.getBoundingClientRect();
	const anchorX = rect.left + rect.width / 2;
	const anchorY = rect.top + rect.height / 2;

	const angleDeg = angle(x, y, anchorX, anchorY);
	const eyes = document.querySelectorAll('.eyesocket');
	eyes.forEach(eye => {
		eye.style.transform = `rotate(${90 + angleDeg}deg)`;
	});
}

function angle(cx, cy, ex, ey){
	const dy = ey - cy;
	const dx = ex - cx;
	const rad = Math.atan2(dy, dx);
	const deg = rad * 180 / Math.PI;
	return deg;
}

if ('serviceWorker' in navigator){
	window.addEventListener('load', () => {
		//if service worker is already registered, skip
		if (navigator.serviceWorker.controller){
			console.log('%cService Worker already registered', 'color: orange;');
			return;
		}
		navigator.serviceWorker
			.register('./serviceWorkerPoketabS.js', {scope: './'})
			.then(() => {
				console.log('%cService Worker Registered', 'color: deepskyblue;');
			})
			.catch(err => console.log(`Service Worker: Error ${err}`));
	});
}