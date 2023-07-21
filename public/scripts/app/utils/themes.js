//enable strict mode
'use strict';

import { fragmentBuilder } from './fragmentBuilder.js';
import { themeAccent } from '../../themeLoader.js';

export const themeArray = Object.keys(themeAccent);
export default themeAccent;

export const themePicker = document.createElement('div');
themePicker.className = 'themePicker';

const themeListFragment = fragmentBuilder({
	tag: 'ul',
	attr: {
		class: 'themeList'
	},
	childs: themeArray.map((theme) => {
		return {
			tag: 'li',
			attr: {
				class: 'theme clickable playable',
				id: theme
			},
			childs: [
				{
					tag: 'img',
					attr: {
						class: 'themeIcon',
						src: `/images/backgrounds/${theme}_icon.webp`,
						alt: 'Theme Thumbnail'
					}
				},
				{
					tag: 'span',
					text: theme.charAt(0).toUpperCase() + theme.slice(1)
				}
			]
		};
	})
});

themePicker.appendChild(themeListFragment);