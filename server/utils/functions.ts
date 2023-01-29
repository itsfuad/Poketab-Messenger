export function makeid() {
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let id = '';
	for (let i = 0; i < 12; i++) {
		// generate a random character from 0-9, A-Z, or a-z
		id += possible.charAt(Math.floor(Math.random() * possible.length));
		if (i === 2 || i === 5 || i === 8) {  // insert a hyphen at the 3rd, 6th, and 9th positions
			id += '-';
		}
	}
	return id;
}

export const keyformat = /^[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}$/;

//module.exports = {makeid, keyformat};