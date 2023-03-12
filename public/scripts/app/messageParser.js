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
 * 
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
		if (data[tag]){
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
 * 
 * @param {string} message 
 * @returns {string}
 */
export function isEmoji(message){
	const regex = /^([\uD800-\uDBFF][\uDC00-\uDFFF])+$/;
	return regex.test(message);
}