import { test, expect } from '@jest/globals';
import { makeid } from './../functions.js';
//using jest

//makeid should return a string in xx-xxx-xx format
test('makeid should return a string in xx-xxx-xx format', () => {
	expect(makeid()).toMatch(/^[a-zA-Z0-9]{2}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{2}$/);
});

//ids should be unique
test('ids should be unique', () => {
	const ids = [];
	for (let i = 0; i < 1000000; i++) {
		ids.push(makeid());
	}
	console.log(`Generated ${ids.length} ids | ${new Set(ids).size} unique ids`);
	expect(new Set(ids).size).toBe(ids.length);
});