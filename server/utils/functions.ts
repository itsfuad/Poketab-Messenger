export function makeid() {
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let id = '';
	for (let i = 0; i < 7; i++) {
		// generate a random character from 0-9, A-Z, or a-z for xx-xxx-xx
		id += possible.charAt(Math.floor(Math.random() * possible.length));
		if (i === 1 || i === 4) {
			id += '-';
		}
	}
	return id;
}