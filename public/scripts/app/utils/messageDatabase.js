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
		this.file = new FileObj();
	}
}

class FileObj{
	constructor(){
		this.src = '';
		this.name = '';
		this.size = 0;
		this.duration = 0.0;
		this.loaded = false;
		this.downloadLink = '';
	}
}

/**
 * @type {Map<string, MessageObj>}
 */
export const messageDatabase = new Map();