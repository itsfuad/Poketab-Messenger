import { test, expect, describe } from '@jest/globals';
import { fragmentBuilder } from '../app/utils/fragmentBuilder.js';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');

global.document = dom.window.document;
global.window = dom.window;
global.DocumentFragment = dom.window.DocumentFragment;


describe('fragmentBuilder', () => {
	test('returns a valid document fragment', () => {
		const jsonObj = {
			tag: 'h1',
			text: 'Hello, world!',
			attr: {
				id: 'greeting',
				class: 'title'
			}
		};

		const fragment = fragmentBuilder(jsonObj);

		expect(fragment).toBeInstanceOf(DocumentFragment);
		expect(fragment.querySelector('h1')).not.toBeNull();
		expect(fragment.querySelector('h1').textContent).toBe('Hello, world!');
		expect(fragment.querySelector('h1').id).toBe('greeting');
		expect(fragment.querySelector('h1').classList).toContain('title');
	});

	test('throws an error if jsonObj is not an object', () => {
		const jsonObj = 'not an object';

		expect(() => {
			fragmentBuilder(jsonObj);
		}).toThrow('jsonObj must be an object');
	});

	test('throws an error if childs property is not an array', () => {
		const jsonObj = {
			tag: 'div',
			childs: 'not an array'
		};

		expect(() => {
			fragmentBuilder(jsonObj);
		}).toThrow('Childs must be an array');
	});

	test('throws an error if child property is not an object', () => {
		const jsonObj = {
			tag: 'div',
			child: 'not an object'
		};

		expect(() => {
			fragmentBuilder(jsonObj);
		}).toThrow('Child must be an object');
	});
});
