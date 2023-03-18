import { expect, test } from '@jest/globals';
import { escapeXSS, TextParser, parseTemplate } from '../app/utils/messageParser';

//test for escapeXSS
test('escapeXSS should return the same string if it is safe', () => {
	expect(escapeXSS('Hello World')).toBe('Hello World');
});

test('escapeXSS should return the sanitized string if the string is unsafe', () => {
	expect(escapeXSS('\'')).toBe('&apos;');
	expect(escapeXSS('"')).toBe('&quot;');
	expect(escapeXSS('<')).toBe('&lt;');
	expect(escapeXSS('>')).toBe('&gt;');
	expect(escapeXSS('&')).toBe('&amp;');
});

//test for TextParser
test('TextParser should return the same string if it is safe', () => {
	expect(new TextParser().parse('Hello World')).toBe('Hello World');
	expect(new TextParser().parse('Hello World `i`')).toBe('Hello World <code>i</code>');
	expect(new TextParser().parse('Hello World `i` `j`')).toBe('Hello World <code>i</code> <code>j</code>');
	expect(new TextParser().parse('**Bold**')).toBe('<strong>Bold</strong>');
	expect(new TextParser().parse('**Bold** `i`')).toBe('<strong>Bold</strong> <code>i</code>');
	expect(new TextParser().parse('**Bold** __Italic__')).toBe('<strong>Bold</strong> <em>Italic</em>');
	expect(new TextParser().parse('**Bold** __Italic__ ~~Strikethrough~~')).toBe('<strong>Bold</strong> <em>Italic</em> <del>Strikethrough</del>');
});

//parse template
test('parseTemplate Parses the template', () => {
	const template = 'Hello, {{name}}!';
	const data = { name: 'John' };
	expect(parseTemplate(template, data)).toBe('Hello, John!');

	const template2 = 'Hello, {{name}}! You have {{count}} unread messages.';
	const data2 = { name: 'John', count: 5 };
	expect(parseTemplate(template2, data2)).toBe('Hello, John! You have 5 unread messages.');

	const template3 = 'Hello, {{name}}! You have {{count}} unread messages. {{{html}}}';
	const data3 = { name: 'John', count: 5, html: '<strong>HTML</strong>' };
	expect(parseTemplate(template3, data3)).toBe('Hello, John! You have 5 unread messages. <strong>HTML</strong>');
});