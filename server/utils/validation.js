const avList = [
	'mankey',
	'meowth',
	'mew',
	'squirtle',
	'squirtle2',
	'charmander',
	'charmander2',
	'psyduck',
	'caterpie',
	'eevee',
	'haunter',
	'mewtwo',
	'jigglypuff',
	'pichu',
	'pidgey',
	'pikachu',
	'dratini',
	'raichu',
	'zubat',
	'articuno',
	'bellsprout',
	'blastoise',
	'bulbasaur2',
	'bullbasaur',
	'charizard',
	'rattata',
	'rayquaza',
	'snorlax',
	'ivysaur',
	'palkia',
];


const isRealString = (str) => {
	return typeof str === 'string' && str.trim().length > 0;
};

function validateUserName(username){
	const name_format = /^[a-zA-Z0-9\u0980-\u09FF]{3,20}$/;
	return ( isRealString(username) && name_format.test(username) && username.trim().length > 0);
}

function validateAvatar(avatar){
	return avList.includes(avatar);
}

function validateKey(key){
	const keyformat = /^[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}$/;
	return keyformat.test(key);
}

function validateAll(username, key, avatar){
	return (validateUserName(username) && validateKey(key) && validateAvatar(avatar));
}

const reactArray = {
	primary: ['💙', '😆','😠','😢','😮','🙂','🌻'],
	last: '🌻',
	expanded: ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','😘','🥰','😗','😙','😚','🙂','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','🥱','😴','😌','😛','😜','😝','🤤','😒','😓','😔','😕','🙃','🤑','😲','🙁','😖','😞','😟','😤','😢','😭','😦','😧','😨','😩','🤯','😬','😰','😱','🥵','🥶','😳','🤪','😵','🥴','😠','😡','🤬','😷','🤒','🤕','🤢','🤮','🤧','😇','🥳','🥺','🤠','🤡','🤥','🤫','🤭','🧐','🤓','😈','👿','👹','👺','💀','☠','👻','👽','👾','🤖','💩','😺','😸','😹','😻','🙈','🙉','🙊','🐵','🐶','🐺','🐱','🦁','🐯','🦒','🦊','🦝','🐮','🐷','🐗','🐭','🐹','🐰','🐻','🐨','🐼','🐸','🦓','🐴','🦄','🐔','🐲','🐽','🐧','🐥','🐤','🐣', '🌻', '🌸', '🥀', '🌼', '🌷', '🌹', '🏵️', '🌺', '🦇','🦋','🐌','🐛','🦟','🦗','🐜','🐝','🐞','🦂','🕷','🕸','🦠','🧞‍♀️','🧞‍♂️','🗣','👀','🦴','🦷','👅','👄','🧠','🦾','🦿','👩🏻','👨🏻','🧑🏻','👧🏻','👦🏻','🧒🏻','👶🏻','👵🏻','👴🏻','🧓🏻','👩🏻‍🦰','👨🏻‍🦰','👩🏻‍🦱','👨🏻‍🦱','👩🏻‍🦲','👨🏻‍🦲','👩🏻‍🦳','👨🏻‍🦳','👱🏻‍♀️','👱🏻‍♂️','👸🏻','🤴🏻','👳🏻‍♀️','👳🏻‍♂️','👲🏻','🧔🏻','👼🏻','🤶🏻','🎅🏻','👮🏻‍♀️','👮🏻‍♂️','🕵🏻‍♀️','🕵🏻‍♂️','💂🏻‍♀️','💂🏻‍♂️','👷🏻‍♀️','👷🏻‍♂️','👩🏻‍⚕️','👨🏻‍⚕️','👩🏻‍🎓','👨🏻‍🎓','👩🏻‍🏫','👨🏻‍🏫','👩🏻‍⚖️','👨🏻‍⚖️','👩🏻‍🌾','👨🏻‍🌾','👩🏻‍🍳','👨🏻‍🍳','👩🏻‍🔧','👨🏻‍🔧','👩🏻‍🏭','👨🏻‍🏭','👩🏻‍💼','👨🏻‍💼','👩🏻‍🔬','👨🏻‍🔬','👩🏻‍💻','👨🏻‍💻','👩🏻‍🎤','👨🏻‍🎤','👩🏻‍🎨','👨🏻‍🎨','👩🏻‍✈️','👨🏻‍✈️','👩🏻‍🚀','👨🏻‍🚀','👩🏻‍🚒','👨🏻‍🚒','🧕🏻','👰🏻','🤵🏻','🤱🏻','🤰🏻','🦸🏻‍♀️','🦸🏻‍♂️','🦹🏻‍♀️','🦹🏻‍♂️','🧙🏻‍♀️','🧙🏻‍♂️','🧚🏻‍♀️','🧚🏻‍♂️','🧛🏻‍♀️','🧛🏻‍♂️','🧜🏻‍♀️','🧜🏻‍♂️','🧝🏻‍♀️','🧝🏻‍♂️','🧟🏻‍♀️','🧟🏻‍♂️','🙍🏻‍♀️','🙍🏻‍♂️','🙎🏻‍♀️','🙎🏻‍♂️','🙅🏻‍♀️','🙅🏻‍♂️','🙆🏻‍♀️','🙆🏻‍♂️','🧏🏻‍♀️','🧏🏻‍♂️','💁🏻‍♀️','💁🏻‍♂️','🙋🏻‍♀️','🙋🏻‍♂️','🙇🏻‍♀️','🙇🏻‍♂️','🤦🏻‍♀️','🤦🏻‍♂️','🤷🏻‍♀️','🤷🏻‍♂️','💆🏻‍♀️','💆🏻‍♂️','💇🏻‍♀️','💇🏻‍♂️','🧖🏻‍♀️','🧖🏻‍♂️','🤹🏻‍♀️','🤹🏻‍♂️','👩🏻‍🦽','👨🏻‍🦽','👩🏻‍🦼','👨🏻‍🦼','👩🏻‍🦯','👨🏻‍🦯','🧎🏻‍♀️','🧎🏻‍♂️','🧍🏻‍♀️','🧍🏻‍♂️','🚶🏻‍♀️','🚶🏻‍♂️','🏃🏻‍♀️','🏃🏻‍♂️','💃🏻','🕺🏻','🧗🏻‍♀️','🧗🏻‍♂️','🧘🏻‍♀️','🧘🏻‍♂️','🛀🏻','🛌🏻','🕴🏻','🏇🏻','🏂🏻','💪🏻','🦵🏻','🦶🏻','👂🏻','🦻🏻','👃🏻','🤏🏻','👈🏻','👉🏻','☝🏻','👆🏻','👇🏻','✌🏻','🤞🏻','🖖🏻','🤘🏻','🤙🏻','🖐🏻','✋🏻','👌🏻','👍🏻','👎🏻','✊🏻','👊🏻','🤛🏻','🤜🏻','🤚🏻','👋🏻','🤟🏻','✍🏻','👏🏻','👐🏻','🙌🏻','🤲🏻','🙏🏻','🤝🏻','💅🏻','📌','❤️','🧡','💛','💚','💙','💜','🤎','🖤','🤍','💔','❣','💕','💞','💓','💗','💖','💘','💝','💟','💌','💢','💥','💤','💦','💨','💫'],
};

module.exports = {isRealString, validateUserName, validateAll, validateAvatar, validateKey, reactArray, avList};