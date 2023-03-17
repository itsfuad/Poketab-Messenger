//enable strict mode
'use strict';

function escapeXSS(text) {
	// Define the characters that need to be escaped
	const escapeChars = {
		'\'': '&apos;',
		'<': '&lt;',
		'>': '&gt;',
		'&': '&amp;',
		'"': '&quot;'
	};
	return text.replace(/[<>'"&]/g, match => escapeChars[match]);
}


/**
 * Class to parse text and return HTML
 * Supported markdown codes:
 * 1. Bold: **bold text**
 * 2. Italic: _italic text_
 * 3. Strike-through: ~~strike-through text~~
 * 4. Heading 1-6: # Heading 1 to ###### Heading 6
 * 5. Code block: ```language
 * 					code block
 * 				```
 * 6. Inline code: `inline code`
 * 7. Links: https://www.google.com
 * 8. Emojis: 😄
 * 9. Escaping: \* to escape bold, \_ to escape italic, \~ to escape strike-through, \# to escape heading, \` to escape inline code
 */
export class TextParser {
	constructor() {
		// Define regular expressions for parsing different markdown codes
		this.boldRegex = /\*\*([^*]+)\*\*/g;
		this.italicRegex = /_([^_]+)_/g;
		this.strikeRegex = /~~([^~]+)~~/g;
		this.headingRegex = /^#+\s+(.+)$/gm;
		this.codeRegex = /```([^`]+)```/g;
		this.monoRegex = /`([^`]+)`/g;
		this.escapeBackTicksRegex = /\\`/g;
		this.escapeBoldRegex = /\\\*/g;
		this.escapeItalicRegex = /\\_/g;
		this.escapeStrikeRegex = /\\~/g;
		this.escapeHeadingRegex = /\\#/g;
		this.linkRegex = /(https?:\/\/[^\s]+)/g;
		this.emojiRegex = /^([\uD800-\uDBFF][\uDC00-\uDFFF])+$/;
	}
  
	// Function to parse text and return HTML
	parse(text) {
		// Escape special characters
		text = escapeXSS(text);

		// Parse markdown codes
		text = this.escapeBackTicks(text);
		text = this.escapeItalic(text);
		text = this.escapeStrike(text);
		text = this.escapeBold(text);
		text = this.escapeHeading(text);

		text = this.parseBold(text);
		text = this.parseItalic(text);
		text = this.parseStrike(text);
		text = this.parseHeading(text);
		text = this.parseCode(text);
		text = this.parseMono(text);
		text = this.parseLink(text);
		text = this.parseEmoji(text);
	
		return text;
	}
  
	// Function to parse bold text
	parseBold(text) {
		return text.replace(this.boldRegex, '<strong>$1</strong>');
	}

	escapeBackTicks(text){
		return text.replace(this.escapeBackTicksRegex, '&#96;');
	}

	escapeBold(text){
		return text.replace(this.escapeBoldRegex, '&#42;');
	}

	escapeItalic(text){
		return text.replace(this.escapeItalicRegex, '&#95;');
	}

	escapeStrike(text){
		return text.replace(this.escapeStrikeRegex, '&#126;');
	}

	escapeHeading(text){
		return text.replace(this.escapeHeadingRegex, '&#35;');
	}
  
	// Function to parse italic text
	parseItalic(text) {
		return text.replace(this.italicRegex, '<em>$1</em>');
	}
  
	// Function to parse strike-through text
	parseStrike(text) {
		return text.replace(this.strikeRegex, '<s>$1</s>');
	}
  
	// Function to parse headings
	parseHeading(text) {
		text = text.replace(/^(#{1,6})\s(.*)$/gm, function(match, p1, p2) {
			const level = p1.length;
			return `<h${level}>${p2}</h${level}>`;
		});
		return text;
	}
  
	// Function to parse code blocks
	parseCode(text) {
		const regex = /```(\w*)([^`]+?)```/gs;
		return text.replace(regex, (match, lang, code) => {
			console.log(`Language found: ${lang} lang=='' ${lang == ''} lang==undefined ${lang == undefined} isSupportedLanguage ${this.isSupportedLanguage(lang)}`);
			if (lang == '' || lang == undefined || !this.isSupportedLanguage(lang)) {
				console.log(`Unsupported language: ${lang}`);
				lang = 'txt';
			}
			console.log(`Language found: ${lang}`);
			lang = `class="language-${lang} line-numbers" data-lang="${lang}" data-clip="Copy"`;
			return `<pre ${lang}><code>${code.trim()}</code></pre>`;
		});
	}
		
	isSupportedLanguage(lang) {
		const supportedLangs = ['js', 'py', 'java', 'html', 'css', 'cpp', 'c', 'php', 'sh', 'sql', 'json', 'txt', 'xml', 'cs', 'go', 'rb', 'bat'];
		return supportedLangs.includes(lang);
	}	  

	// Function to parse mono text
	parseMono(text) {
		return text.replace(this.monoRegex, '<code>$1</code>');
	}
  
	// Function to parse links
	parseLink(text) {
		return text.replace(this.linkRegex, '<a href=\'$&\' rel=\'noopener noreferrer\' target=\'_blank\'>$&</a>');
	}

	parseEmoji(text) {
		//replace white space with empty string
		return text.replace(this.emojiRegex, '<span class="emoticon">$&</span>');
	}
}

/**
 * Simple templating engine that parses mustache-like tags in a template string and replaces them with the corresponding data value.
 * {{tag}} for text and {{{tag}}} for HTML
 * @param {string} template Template to parse 
 * @param {Object} data 
 * @returns string
 */

export function parseTemplate(template, data) {
	// regex to match mustache-like tags for HTML
	// eslint-disable-next-line no-useless-escape
	const htmlRegex = /\{\{\{([\w\s\.\[\]]*)\}\}\}/g;
	
	// regex to match mustache-like tags for text
	// eslint-disable-next-line no-useless-escape
	const textRegex = /\{\{([\w\s\.\[\]]*)\}\}/g;
	
	// replace all instances of mustache-like tags with the corresponding data value
	const htmlResult = template.replace(htmlRegex, (match, tag) => {
		// use eval() to evaluate the tag expression and retrieve the data value
		if (data[tag]){
			return data[tag];
		}
	});
  
	const textResult = htmlResult.replace(textRegex, (match, tag) => {
		//if tag found in data
		if (data[tag]){
			//if data is a number, convert to string, otherwise return data
			if( typeof data[tag] == 'number'){
				return data[tag].toString();
			}else{
				return data[tag];
			}
		}
	});
  
	return textResult;
}

/**
 * Checks if a string is a single or continuous group of emoji characters
 * @param {string} message 
 */
export function isEmoji(message){
	const regex = /^([\uD800-\uDBFF][\uDC00-\uDFFF])+$/;
	return regex.test(message);
}