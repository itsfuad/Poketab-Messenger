import crypto from 'crypto';
import { keyStore } from '../database/db';

class idGenerator{
	private static instance: idGenerator;
	private constructor() {
		// private constructor to prevent creating new instances
	}
	public static getInstance(): idGenerator {
		if (!idGenerator.instance) {
			idGenerator.instance = new idGenerator();
		}
		return idGenerator.instance;
	}

	public makeid(): string {
		const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let id = '';
		for (let i = 0; i < 7; i++) {
			// generate a random character from 0-9, A-Z, or a-z for xx-xxx-xx
			//use crypto.randomBytes instead of Math.random
			id += possible.charAt(crypto.randomBytes(1)[0] % possible.length);
			if (i === 1 || i === 4) {
				id += '-';
			}
		}

		if (keyStore.hasKey(id)) {
			// if id already exists, generate a new one
			return this.makeid();
		}
		return id;
	}
}

export const makeid = idGenerator.getInstance().makeid;