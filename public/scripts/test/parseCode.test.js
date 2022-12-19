const message = `
Check this code
\`\`\`js
function compareVersions(requiredVersion, currentVersion) {
	const parts1 = requiredVersion.split('.').map(part => parseInt(part));
	const parts2 = currentVersion.split('.').map(part => parseInt(part));
  
	for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
		if (parts1[i] === undefined) return 1;
		if (parts2[i] === undefined) return -1;
		if (parts1[i] < parts2[i]) return 1;
		if (parts1[i] > parts2[i]) return -1;
	}
  
	return 0;
}
\`\`\`

We need to use \`user-agent\` package to get the client browser version and respond back with a fallback page if needed. 

See the \`app.use(checkBrowser);\` is used. 
This will be called each time the \`app\` gets a request. 

and this is our check point
\`\`\`js
const supportedBrowsers = {
	'Chrome': '100', //minumum version
	'Firefox': '100',
	'Edge': '100',
	'Opera': '100',
	'Safari': '14',
	'Chromium': '100',
	'Chromium Webview': '100',
};
\`\`\`
`;

let messageAnswer = `
Check this code 
<pre class="line-numbers language-js" data-lang="js" data-clip="Copy"><code class='js'> 
function compareVersions(requiredVersion, currentVersion) { 
	const parts1 = requiredVersion.split('.').map(part => parseInt(part)); 
	const parts2 = currentVersion.split('.').map(part => parseInt(part)); 
   
	for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) { 
		if (parts1[i] === undefined) return 1; 
		if (parts2[i] === undefined) return -1; 
		if (parts1[i] < parts2[i]) return 1; 
		if (parts1[i] > parts2[i]) return -1; 
	} 
   
	return 0; 
} 
</code></pre> 
 
We need to use <code>user-agent</code> package to get the client browser version and respond back with a fallback page if needed.  
 
See the <code>app.use(checkBrowser);</code> is used.  
This will be called each time the <code>app</code> gets a request.  
 
and this is our check point 
<pre class="line-numbers language-js" data-lang="js" data-clip="Copy"><code class='js'> 
const supportedBrowsers = { 
	'Chrome': '100', //minumum version 
	'Firefox': '100', 
	'Edge': '100', 
	'Opera': '100', 
	'Safari': '14', 
	'Chromium': '100', 
	'Chromium Webview': '100', 
}; 
</code></pre> 
`;

let message2 = `Hello world`;
let message2Answer = `Hello world`;


let containsCode = false;

function parseCode(message) {

	const supportedLanguages = {
		'js': 'javascript',
		'ts': 'typescript',
		'html': 'html',
		'css': 'css',
		'json': 'json',
		'sh': 'bash',
		'bash': 'bash',
		'c': 'c',
		'cpp': 'cpp',
		'c++': 'cpp',
		'cs': 'csharp',
		'c#': 'csharp',
		'csharp': 'csharp',
		'go': 'go',
		'java': 'java',
		'kotlin': 'kotlin',
		'kt': 'kotlin',
		'php': 'php',
		'py': 'python',
		'python': 'python',
		'rb': 'ruby',
		'ruby': 'ruby',
		'swift': 'swift',
		'yaml': 'yaml',
		'yml': 'yaml',
		'xml': 'xml',
		'md': 'markdown',
		'markdown': 'markdown',
		'dart': 'dart',
		'diff': 'diff',
		'dockerfile': 'dockerfile',
		'docker': 'dockerfile',
		'r': 'r',
		'vb': 'vb',
		'vbnet': 'vb',
		'vb.net': 'vb',
	};
	//use regex to get the code blocks
	const regex = /```(.*?)```/gs;
	const codeBlocks = message.match(regex);
	//replace the code blocks with pre tags
	for (let i = 0; i < codeBlocks?.length; i++) {
		const codeBlock = codeBlocks[i];
		const language = codeBlock.split('\n')[0].replace('```', '');
		const codeBlockWithoutBackticks = codeBlock.replace(/```(.*)/g, '');
		let codeBlockWithPreTags = '';
		if (supportedLanguages[language]) {
			codeBlockWithPreTags = `<pre class="line-numbers language-${language}" data-lang="${language}" data-clip="Copy"><code class='${language}'>${codeBlockWithoutBackticks}</code></pre>`;
		} else {
			if (language.split(/\s/).length > 1) {
				const lang = language.split(' ');
				if (supportedLanguages[lang[0]]) {
					codeBlockWithPreTags = `<pre class="line-numbers language-${lang[0]}" data-lang="${[lang[0]]}" data-clip="Copy"><code class='${lang[0]}'>\n${lang.slice(1, lang.length).join(' ')}${codeBlockWithoutBackticks}</code></pre>`;
				}
			} else {
				codeBlockWithPreTags = `<pre class="line-numbers language-text" data-lang="text" data-clip="Copy"><code class='text'>${language}${codeBlockWithoutBackticks}</code></pre>`;
			}
		}
		message = message.replace(codeBlock, codeBlockWithPreTags);
		containsCode = true;
	}
	//replace the inline code with code tags
	const inlineCodeRegex = /`([^`]+)`/g;
	message = message.replace(inlineCodeRegex, '<code>$1</code>');
	return message;
}

//test message with messageanswer
test('ParseCode', () =>{
    expect(parseCode(message)).toEqual(messageAnswer);
});

//test message2 with message2answer
test('ParseCode', () =>{
    expect(parseCode(message2)).toEqual(message2Answer);
});