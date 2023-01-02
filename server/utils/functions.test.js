function makeid() {
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

const ids = [];

//print 10 random ids
for (let i = 0; i < 100000; i++) {
	ids.push(makeid());
}

//check for duplicates
const unique = [...new Set(ids)];
console.log(ids);

if (ids.length === unique.length) {
	console.log('No duplicates found!');
} else {
	console.log('Duplicates found!');
	//print duplicates
	const duplicates = ids.filter((item, index) => ids.indexOf(item) !== index);
	console.log(duplicates);
}