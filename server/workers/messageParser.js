//parent port
import { parentPort, workerData } from 'worker_threads';
function censorBadWords(text) {
    text = text.replace(/fuck/g, 'f**k');
    text = text.replace(/shit/g, 's**t');
    text = text.replace(/bitch/g, 'b**t');
    text = text.replace(/asshole/g, 'a**hole');
    text = text.replace(/dick/g, 'd**k');
    text = text.replace(/pussy/g, 'p**s');
    text = text.replace(/cock/g, 'c**k');
    text = text.replace(/baal/g, 'b**l');
    text = text.replace(/sex/g, 's*x');
    text = text.replace(/Fuck/g, 'F**k');
    text = text.replace(/Shit/g, 'S**t');
    text = text.replace(/Bitch/g, 'B**t');
    text = text.replace(/Asshole/g, 'A**hole');
    text = text.replace(/Dick/g, 'D**k');
    text = text.replace(/Pussy/g, 'P**s');
    text = text.replace(/Cock/g, 'C**k');
    text = text.replace(/Baal/g, 'B**l');
    text = text.replace(/Sex/g, 'S*x');
    return text;
}
function runner(message) {
    message = censorBadWords(message);
    message = sanitize(message);
    message = parseCode(message);
    return message;
}
function sanitize(str) {
    if (str == undefined || str == '' || str == null) {
        return '';
    }
    str = str.replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll('\'', '&apos;').replaceAll('/', '&#x2F;');
    return str;
}
//this is the code to parse the message
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
    if (codeBlocks == null) {
        return message;
    }
    //replace the code blocks with pre tags
    for (let i = 0; i < codeBlocks?.length; i++) {
        const codeBlock = codeBlocks[i];
        const language = codeBlock.split('\n')[0].replace('```', '');
        const codeBlockWithoutBackticks = codeBlock.replace(/```(.*)/g, '');
        let codeBlockWithPreTags = '';
        if (supportedLanguages[language]) {
            codeBlockWithPreTags = `<pre class="line-numbers language-${language}" data-lang="${language}" data-clip="Copy"><code class='${language}'>${codeBlockWithoutBackticks}</code></pre>`;
        }
        else {
            if (language.split(/\s/).length > 1) {
                const lang = language.split(' ');
                if (supportedLanguages[lang[0]]) {
                    codeBlockWithPreTags = `<pre class="line-numbers language-${lang[0]}" data-lang="${[lang[0]]}" data-clip="Copy"><code class='language-${lang[0]}'>\n${lang.slice(1, lang.length).join(' ')}${codeBlockWithoutBackticks}</code></pre>`;
                }
            }
            else {
                codeBlockWithPreTags = `<pre class="line-numbers language-text" data-lang="text" data-clip="Copy"><code class='language-text'>${language}${codeBlockWithoutBackticks}</code></pre>`;
            }
        }
        message = message.replace(codeBlock, codeBlockWithPreTags);
    }
    //replace the inline code with code tags
    const inlineCodeRegex = /`([^`]+)`/g;
    message = message.replace(inlineCodeRegex, '<code>$1</code>');
    return message;
}
const message = runner(workerData.message);
if (parentPort) {
    parentPort.postMessage(message);
}
//# sourceMappingURL=messageParser.js.map