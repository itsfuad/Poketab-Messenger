export class MessageObj {
	constructor() {
		this.type = '';
		this.sender = '';
		this.replyTo = '';
		this.timeStamp = 0;
		this.timeout = undefined;
		this.seenBy = new Set();
		this.reacts = new Map();
		//this.file = new FileObj();
	}
}

export class TextMessage extends MessageObj {
	constructor() {
		super();
		this.text = '';
		this.type = 'text';
	}
}

export class FileMessage extends MessageObj {
	constructor(){
		super();
		this.type = 'file';
		this.name = '';
		this.size = 0;
		this.loaded = false;
		this.src = '';
		this.downloadLink = '';
	}
}

export class AudioMessage extends FileMessage {
	constructor(){
		super();
		this.type = 'audio';
		this.duration = 0.0;
	}
}


/**
 * @type {Map<string, MessageObj>}
 */
export const messageDatabase = new Map();