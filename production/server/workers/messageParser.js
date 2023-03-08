//parent port
import { parentPort, workerData } from 'worker_threads';
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
        // Define the characters that need to be escaped
        this.escapeChars = {
            "'": "&apos;",
            "<": "&lt;",
            ">": "&gt;",
            "&": "&amp;",
            '"': "&quot;"
        };
    }
    // Function to parse text and return HTML
    parse(text) {
        // Escape special characters
        text = this.escape(text);
        // Parse markdown codes
        text = this.parseBold(text);
        text = this.parseItalic(text);
        text = this.parseStrike(text);
        text = this.parseHeading(text);
        text = this.parseCode(text);
        text = this.parseMono(text);
        text = this.parseLink(text);
        return text;
    }
    // Function to escape special characters
    escape(text) {
        return text.replace(/[<>'"&]/g, match => this.escapeChars[match]);
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
        text = text.replace(/^(#{1,6})\s(.*)$/gm, function (match, p1, p2) {
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
}
function runner(message) {
    const parser = new TextParser();
    return parser.escape(message);
}
const message = runner(workerData.message);
if (parentPort) {
    parentPort.postMessage(message);
}
//# sourceMappingURL=messageParser.js.map