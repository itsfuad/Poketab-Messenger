import { test, expect } from '@jest/globals';
import { generateUniqueId } from './../functions.js';
import { validateUserName } from './../validation.js';
//using jest
//makeid should return a string in xx-xxx-xx format
test('makeid should return a string in xx-xxx-xx format', () => {
    expect(generateUniqueId()).toMatch(/^[a-zA-Z0-9]{2}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{2}$/);
});
//ids should be unique
test('ids should be unique', () => {
    const ids = [];
    for (let i = 0; i < 100000; i++) {
        ids.push(generateUniqueId());
    }
    console.log(`Generated ${ids.length} ids | ${new Set(ids).size} unique ids`);
    expect(new Set(ids).size).toBe(ids.length);
});
//test to username validation
test('validateUsername should return true for valid usernames', () => {
    expect(validateUserName('a')).toBe(false);
    expect(validateUserName('a'.repeat(20))).toBe(true);
    expect(validateUserName('a'.repeat(20).toUpperCase())).toBe(true);
    expect(validateUserName('a'.repeat(20).toLowerCase())).toBe(true);
    expect(validateUserName('FuadHasan')).toBe(true);
    expect(validateUserName('_itsfuad')).toBe(true);
    expect(validateUserName('তুশি')).toBe(true);
    expect(validateUserName('কামাল')).toBe(true);
});
//test to username validation
test('validateUsername should return false for invalid usernames', () => {
    expect(validateUserName('')).toBe(false);
    expect(validateUserName('a'.repeat(21))).toBe(false);
    expect(validateUserName('a'.repeat(20).toUpperCase() + '1'.repeat(6))).toBe(false);
    expect(validateUserName('a'.repeat(20).toLowerCase() + '1'.repeat(6))).toBe(false);
    expect(validateUserName('Fuad Hasan')).toBe(false);
    expect(validateUserName(':)')).toBe(false);
    expect(validateUserName('😃😃')).toBe(false);
    expect(validateUserName('User😎😎')).toBe(false);
});
//# sourceMappingURL=functions.test.js.map