import { keyStore } from "../database/db.js";

export function makeid() : string {
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let id = '';
	for (let i = 0; i < 7; i++) {
		// generate a random character from 0-9, A-Z, or a-z for xx-xxx-xx
		id += possible.charAt(Math.floor(Math.random() * possible.length));
		if (i === 1 || i === 4) {
			id += '-';
		}
	}

	if (keyStore.hasKey(id)) {
		console.log('Duplicate key generated, generating new key...');
		// if the key already exists, generate a new one
		return makeid();
	}
	return id;
}