import { test, expect, describe } from '@jest/globals';
import { sanitizeImagePath, sanitize } from '../app/utils/sanitizer.js';

//test for sanitizeImagePath
describe('sanitizeImagePath', () => {
	test('sanitizeImagePath should return the same path if it is safe', () => {
		expect(sanitizeImagePath('/images/normal.png')).toBe('/images/normal.png');
	});

	test('sanitizeImagePath should return the danger image if the path is unsafe', () => {
		expect(sanitizeImagePath('<script>alert("Hello");</script>')).toBe('/images/danger-mini.webp');
	});
});


//test for sanitize
describe('sanitize text', () => {
	test('sanitize should return the same string if it is safe', () => {
		expect(sanitize('Hello World')).toBe('Hello World');
	});

	test('sanitize should return the sanitized string if the string is unsafe', () => {
		expect(sanitize('<script>alert("Hello");</script>')).toBe('&lt;script&gt;alert(&quot;Hello&quot;);&lt;&#x2F;script&gt;');
	});
});