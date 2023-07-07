import { Stickers } from './../../../stickers/stickersConfig.js';
import { parseTemplate } from './messageParser.js';

const stickersTemplate = document.getElementById('stickersTemplate');
document.getElementById('stickersTemplate').remove();

export function loadStickerHeaders() {

	const heads = Object.values(Stickers).map((sticker) => {
		return `<img src="/stickers/${sticker.name}/animated/${sticker.icon}.webp" class="${sticker.name}" data-name="${sticker.name}" alt="${sticker.name}">`;
	}).join('');

	let stickersArray = '';

	Object.values(Stickers).forEach((sticker) => {
		//console.log(sticker, sticker.count);

		let stickerBoard = '';

		for (let i = 1; i <= sticker.count; i++) {
			stickerBoard += `<img src="/stickers/${sticker.name}/static/${i}-mini.webp" data-name="${sticker.name}/animated/${i}" class="sendable">`;
		}

		stickersArray += `
        <div class="stickerBoard ${sticker.name}">
            ${stickerBoard}
        </div>`;
	});

	const stickersKeyboard = parseTemplate(stickersTemplate.innerHTML, {
		heads: heads,
		stickers: stickersArray
	});

	//console.log(stickersKeyboard);
	document.getElementById('stickersKeyboard').innerHTML += stickersKeyboard;

	const stickerHeads = document.querySelector('.stickersHeader');

	stickerHeads.addEventListener('click', (e) => {
		//console.log(e.target.dataset.name);
		if (e.target.dataset.name) {
			const stickerBoard = document.querySelector(`.stickerBoard.${e.target.dataset.name}`);
			setTimeout(() => {
				stickerBoard.scrollIntoView({ behavior: 'smooth', inline: 'center' });
			}, 150);
		}
	});

	const prevBtn = document.querySelector('.headers .prev');
	const nextBtn = document.querySelector('.headers .next');

	prevBtn.addEventListener('click', () => {
		const stickerHeads = document.querySelector('.stickersHeader');
		stickerHeads.scrollBy(-100, 0);
	});

	nextBtn.addEventListener('click', () => {
		const stickerHeads = document.querySelector('.stickersHeader');
		stickerHeads.scrollBy(100, 0);
	});

	const stickersBody = document.querySelector('.stickersBody');
	stickersBody.addEventListener('scroll', () => {
		//detect which sticker is in view
		const stickerBoards = document.querySelectorAll('.stickerBoard');
		//console.log(stickerBoards[0].getBoundingClientRect().x, stickerBoards[0].getBoundingClientRect().width);
		stickerBoards.forEach((stickerBoard) => {
			const rect = stickerBoard.getBoundingClientRect();
			if (rect.x <= rect.width / 2 && rect.x + rect.width >= rect.width / 2) {
				//console.log(stickerBoard.classList[1]);
				const selectedSticker = localStorage.getItem('selectedSticker') || 'catteftel';
				if (selectedSticker) {
					const head = document.querySelector(`.stickersHeader img.${selectedSticker}`);
					if (!head) return;
					head.dataset.selected = 'false';
				}
				const head = document.querySelector(`.stickersHeader img.${stickerBoard.classList[1]}`);
				if (!head) return;
				head.dataset.selected = 'true';
				localStorage.setItem('selectedSticker', stickerBoard.classList[1]);
			}
		});
	});
}