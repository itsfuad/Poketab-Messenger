import { test, expect, describe } from '@jest/globals';
import { isEmoji, emojiParser } from '../app/utils/messageParser.js';

describe('isEmoji', () => {
	test('Does the text contain only emoji 🐸', () => {
		expect(isEmoji('🐸')).toBe(true);
	});
	test('Does the text contain only emoji 🐸🐸', () => {
		expect(isEmoji('🐸🐸😂😒')).toBe(true);
	});
	test('Does the text contain only emoji "Hi🐸🐸"', () => {
		expect(isEmoji('Hi🐸🐸😘')).toBe(false);
	});
	test('Does the text contain only emoji "🐸Hi🐸"', () => {
		expect(isEmoji('🐸Hi🐸')).toBe(false);
	});
	test('Does the text contain only emoji "🐸🐸🐸Hi"', () => {
		expect(isEmoji('❤️❤️Hi')).toBe(false);
	});
	test('Does the text contain only emoji "Hi🎈"', () => {
		expect(isEmoji('🐸🐸Hi🐸')).toBe(false);
	});

	test('Symbols combination should be converted to emoji', () => {
		expect(emojiParser(':)')).toBe('🙂');
		expect(emojiParser(':(')).toBe('😞');
		expect(emojiParser(':D')).toBe('😀');
		expect(emojiParser(':P')).toBe('😛');
		expect(emojiParser(':O')).toBe('😮');
		expect(emojiParser(':|')).toBe('😐');
		expect(emojiParser(':/')).toBe('😕');
		expect(emojiParser(';*')).toBe('😘');
		expect(emojiParser(':*')).toBe('😗');
		expect(emojiParser('>:(')).toBe('😠');
		expect(emojiParser(':\'(')).toBe('😢');
		expect(emojiParser('o3o')).toBe('😗');
		expect(emojiParser('^3^')).toBe('😙');
		expect(emojiParser('^_^')).toBe('😊');
		expect(emojiParser('<3')).toBe('❤️');
		expect(emojiParser('>_<')).toBe('😣');
		expect(emojiParser('>_>')).toBe('😒');
	});

});