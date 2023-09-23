export const avList = [
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
export const isRealString = (str) => {
    return typeof str === 'string' && str.trim().length > 0;
};
export function validateUserName(username) {
    const name_format = /^[a-zA-Z0-9_\u0980-\u09FF]{3,20}$/;
    return (isRealString(username) && name_format.test(username) && username.trim().length > 0);
}
export function validateAvatar(avatar) {
    return avList.includes(avatar);
}
export function validateKey(key) {
    const keyformat = /^[a-zA-Z0-9]{2}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{2}$/;
    return keyformat.test(key);
}
export function validateAll(username, key, avatar) {
    return (validateUserName(username) && validateKey(key) && validateAvatar(avatar));
}
