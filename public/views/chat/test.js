function escapeXSS(text) {
	// Define the characters that need to be escaped
	const escapeChars = {
	"'": "&apos;",
	"<": "&lt;",
	">": "&gt;",
	"&": "&amp;",
	'"': "&quot;"
	};
	return text.replace(/[<>'"&]/g, match => escapeChars[match]);
}



const msg = [];

msg[0] = '```cpp\n#include &apos; <iostream>\n``` `iostream` is header. ```cpp using " == namespace std;\n``` `std` is namespace.';

msg[1] = 'Hello world';

msg[2] = '&apos; &';

msg[3] = '<script>alert(1)</script>';

msg[4] = '> <script>alert(1)</script>';

msg[5] = '/ > https://itsfuad.me <';

msg[6] = '&nbsp;';

msg[7] = 'https://itsfuad.me';

msg[8] = 'This is **Bold** and this is _italic_';


msg[15] = '~~This is a strikethrough~~';

msg[16] = '😁😁';

msg[17] = '<script>console.log(1)</script>';

const messages = document.getElementById('messages');



class TextParser {
	constructor() {
	  // Define regular expressions for parsing different markdown codes
	  this.boldRegex = /\*\*([^*]+)\*\*/g;
	  this.italicRegex = /_([^_]+)_/g;
	  this.strikeRegex = /~~([^~]+)~~/g;
	  this.headingRegex = /^#+\s+(.+)$/gm;
	  this.codeRegex = /```([^`]+)```/g;
	  this.monoRegex = /`([^`]+)`/g;
	  this.linkRegex = /(https?:\/\/[^\s]+)/g;
	  this.emojiRegex = /^([\uD800-\uDBFF][\uDC00-\uDFFF])+$/;
	}
  
	// Function to parse text and return HTML
	parse(text) {
	  // Escape special characters
	  text = escapeXSS(text);
  
	  // Parse markdown codes
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
	  return text.replace(this.boldRegex, "<strong>$1</strong>");
	}
  
	// Function to parse italic text
	parseItalic(text) {
	  return text.replace(this.italicRegex, "<em>$1</em>");
	}
  
	// Function to parse strike-through text
	parseStrike(text) {
	  return text.replace(this.strikeRegex, "<s>$1</s>");
	}
  
	// Function to parse headings
	parseHeading(text) {
		text = text.replace(/^(#{1,6})\s(.*)$/gm, function(match, p1, p2) {
			let level = p1.length;
			return `<h${level}>${p2}</h${level}>`;
		  });
	  	return text;
	}
  
	// Function to parse code blocks
	parseCode(text) {
		const regex = /```(\w*)([^`]+?)```/gs;
		return text.replace(regex, (match, lang, code) => {
		  if (lang && !this.isSupportedLanguage(lang)) {
			console.warn(`Unsupported language: ${lang}`);
			lang = '';
		  }
		  lang = lang ? ` class="language-${lang}" data-lang="${lang}"` : ' class="language-txt"';
		  return `<pre${lang}><code>${code.trim()}</code></pre>`;
		});
	  }
	  
	isSupportedLanguage(lang) {
		const supportedLangs = ['js', 'py', 'java', 'html', 'css', 'cpp', 'c', 'php', 'sh', 'sql', 'json', 'txt', 'xml', 'cs', 'go', 'rb', 'bat'];
		return supportedLangs.includes(lang);
	}	  

	// Function to parse mono text
	parseMono(text) {
	  return text.replace(this.monoRegex, "<code>$1</code>");
	}
  
	// Function to parse links
	parseLink(text) {
	  return text.replace(this.linkRegex, "<a href='$&' rel='noopener noreferrer' target='_blank'>$&</a>");
	}

	parseEmoji(text) {
		//replace white space with empty string
		return text.replace(this.emojiRegex, '<span class="emoticon">$&</span>');
	}
  }



const template = document.getElementById('messageTemplate').innerHTML;


function parseTemplate(template, data) {
	// regex to match mustache-like tags for HTML
	const htmlRegex = /\{\{\{([\w\s\.\[\]]*)\}\}\}/g;
	
	// regex to match mustache-like tags for text
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


const ms = msg.join('\n');
  

const m = parseTemplate(template, {
	classList: "All",
	avatarSrc: `https://i.pravatar.cc/300`,
	messageId: 'messageId will go here',
	uid: 'uid will go here',
	type: 'text',
	repId: 'repId will go here',
	title: 'title will go here',
	message: new TextParser().parse(ms),
	replyMsg: 'replyMsg will go here',
	replyFor: 'replyFor will go here',
	time: 1283738483,
	timeStamp: 'timeStamp will go here',
});


//message.innerHTML = m;

//console.log(m);

const fragment = document.createRange().createContextualFragment(m);
fragment.querySelector('.message').classList.add('All');

messages.appendChild(fragment);