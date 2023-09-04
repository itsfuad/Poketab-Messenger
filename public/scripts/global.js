console.log('%cButton Inspector loaded!', 'color: #00ff00; font-weight: bold;');

//all the audio files used in the app
const incommingmessage = new Audio('/sounds/incommingmessage.mp3');
const outgoingmessage = new Audio('/sounds/outgoingmessage.mp3');
const joinsound = new Audio('/sounds/join.mp3');
const leavesound = new Audio('/sounds/leave.mp3');
const typingsound = new Audio('/sounds/typing.mp3');
const locationsound = new Audio('/sounds/location.mp3');
const reactsound = new Audio('/sounds/react.mp3');
const clickSound = new Audio('/sounds/click.mp3');
const stickerSound = new Audio('/sounds/sticker.mp3');
const startrecordingSound = new Audio('/sounds/startrecording.mp3');
const expandSound = new Audio('/sounds/expand.mp3');

let buttonSoundEnabled = true;
let messageSoundEnabled = true;

/**
 * 
 * @param {boolean} state State of the button sound - true for enabled, false for disabled
 */
export function setButtonSound(state) {
	buttonSoundEnabled = state;
	localStorage.setItem('buttonSoundEnabled', state);
}

/**
 * 
 * @param {boolean} state State of the message sound - true for enabled, false for disabled
 */
export function setMessageSound(state) {
	messageSoundEnabled = state;
	localStorage.setItem('messageSoundEnabled', state);
}

/**
 * Loads the button sound preference
 */
export function getButtonSound() {
	const sound = localStorage.getItem('buttonSoundEnabled');
	if (sound === 'false') {
		buttonSoundEnabled = false;
	} else {
		buttonSoundEnabled = true;
		localStorage.setItem('buttonSoundEnabled', true);
	}
	return buttonSoundEnabled;
}
/**
 * Loads the message sound preference
 */
export function getMessageSound() {
	const sound = localStorage.getItem('messageSoundEnabled');
	if (sound === 'false') {
		messageSoundEnabled = false;
	} else {
		messageSoundEnabled = true;
		localStorage.setItem('messageSoundEnabled', true);
	}
	return messageSoundEnabled;
}

getButtonSound();
getMessageSound();

console.log('Message sound: ' + (messageSoundEnabled ? 'enabled' : 'disabled'));
console.log('Button sound: ' + (buttonSoundEnabled ? 'enabled' : 'disabled'));

export function playStartRecordSound(){
	if (!buttonSoundEnabled){
		return;
	}
	//start 0
	startrecordingSound.currentTime = 0;
	startrecordingSound.play();
}

export function playClickSound(){
	if (!buttonSoundEnabled){
		return;
	}
	//start 0
	clickSound.currentTime = 0;
	clickSound.play();
}

export function playOutgoingSound(){
	if (!messageSoundEnabled){
		return;
	}
	outgoingmessage.currentTime = 0;
	outgoingmessage.play();
}

export function playIncomingSound(){
	if (!messageSoundEnabled){
		return;
	}
	incommingmessage.currentTime = 0;
	incommingmessage.play();
}

export function playTypingSound(){
	if (!messageSoundEnabled){
		return;
	}
	typingsound.currentTime = 0;
	typingsound.play();
}

export function playStickerSound(){
	if (!messageSoundEnabled){
		return;
	}
	stickerSound.currentTime = 0;
	stickerSound.play();
}

export function playReactSound(){
	if (!messageSoundEnabled){
		return;
	}
	reactsound.currentTime = 0;
	reactsound.play();
}

export function playLocationSound(){
	if (!messageSoundEnabled){
		return;
	}
	locationsound.currentTime = 0;
	locationsound.play();
}

export function playJoinSound(){
	if (!messageSoundEnabled){
		return;
	}
	joinsound.currentTime = 0;
	joinsound.play();
}

export function playLeaveSound(){
	if (!messageSoundEnabled){
		return;
	}
	leavesound.currentTime = 0;
	leavesound.play();
}

export function playExpandSound(){
	if (!buttonSoundEnabled){
		return;
	}
	expandSound.currentTime = 0;
	expandSound.play();
}

document.addEventListener('click', evt => {
	const elem = evt.target.closest('.btn');
	if (elem){
		//console.log(evt.target);
		if (elem.classList.contains('button-animate')){
			elem.classList.add('buttonPressed');
			setTimeout(() => {
				elem.classList.remove('buttonPressed');
			}, 100);
		}
		if (elem.classList.contains('play-sound')){
			playClickSound();
		}
	}
});