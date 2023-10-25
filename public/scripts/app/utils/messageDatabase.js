export class MessageObj {
	constructor() {
		this.type = '';
		this.kind = '';
		this.sender = '';
		this.replyTo = '';
		this.timeStamp = 0;
		this.timeout = undefined;
		this.seenBy = new Set();
		this.reacts = new Map();
		this.downloaded = false;
		this.fileSrc = '';
		this.fileExt = '';
		this.filename = '';
		this.fileSize = 0;
		this.duration = 0;
		this.downloadLink = '';
	}
}

/**
 * @type {Map<string, MessageObj>}
 */
export const messageDatabase = new Map();