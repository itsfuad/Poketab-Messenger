import { expect, test, describe } from '@jest/globals';
import { escapeXSS, TextParser, parseTemplate } from '../app/utils/messageParser';

//test for escapeXSS
describe('escapeXSS', () => {
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
});


//test for TextParser
describe('TextParser', () => {
	test('TextParser should return the same string if it is safe', () => {
		expect(new TextParser().parse('Hello World')).toBe('Hello World');
		expect(new TextParser().parse('Hello World `i`')).toBe('Hello World <code>i</code>');
		expect(new TextParser().parse('Hello World `i` `j`')).toBe('Hello World <code>i</code> <code>j</code>');
		expect(new TextParser().parse('**Bold**')).toBe('<strong>Bold</strong>');
		expect(new TextParser().parse('**Bold** `i`')).toBe('<strong>Bold</strong> <code>i</code>');
		expect(new TextParser().parse('**Bold** __Italic__')).toBe('<strong>Bold</strong> <em>Italic</em>');
		expect(new TextParser().parse('**Bold** __Italic__ ~~Strikethrough~~')).toBe('<strong>Bold</strong> <em>Italic</em> <del>Strikethrough</del>');
	});
});

//parse template
describe('parseTemplate', () => {
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

		const template4 = 'Hello, {{name}}! You have {{count}} unread messages. {{{html}}} {{{html}}}';
		const data4 = { name: 'John', count: 5, html: '<strong>HTML</strong>' };
		expect(parseTemplate(template4, data4)).toBe('Hello, John! You have 5 unread messages. <strong>HTML</strong> <strong>HTML</strong>');

		//empty data
		const template5 = 'Hello, {{name}}! You have {{count}} unread messages. {{{html}}} {{{html}}}';
		const data5 = {};
		expect(parseTemplate(template5, data5)).toBe('Hello, ! You have  unread messages.  ');

		//empty template
		const template6 = '';
		const data6 = { name: 'John', count: 5, html: '<strong>HTML</strong>' };
		expect(parseTemplate(template6, data6)).toBe('');

		const template7 = '<div class="{{classes}}" reply-id="{{repID}}">{{{html}}}</div>';
		const data7 = { 'classes': 'self start', 'repID': '2a-28afa-2a981' };
		expect(parseTemplate(template7, data7)).toBe('<div class="self start" reply-id="2a-28afa-2a981"></div>');
	});

	//test for template parser to handle invalid data
	test('parseTemplate should handle invalid data', () => {
		//empty data and template
		const template7 = '';
		const data7 = {};
		expect(parseTemplate(template7, data7)).toBe('');

		//invalid template
		const template8 = 'Hello World';
		const data8 = { name: 'John', count: 5, html: '<strong>HTML</strong>' };
		expect(parseTemplate(template8, data8)).toBe('Hello World');

		//invalid data
		const template9 = 'Hello, {{name}}! You have {{count}} unread messages. {{{html}}} {{{html}}}';
		//expect to throw error
		expect(() => parseTemplate(template9, null)).toThrowError('Data must be an object');

		//invalid template
		const template10 = 293;
		const data10 = { name: 'John', count: 5, html: '<strong>HTML</strong>' };
		expect(() => parseTemplate(template10, data10)).toThrowError('Template must be a string');
	});
});