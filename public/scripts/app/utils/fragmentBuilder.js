/**
 * @author Fuad Hasan
 * Builds a document fragment from a JSON object representing HTML.
 * @param {Object} jsonObj - The JSON object to be converted to HTML.
 * @param {String} jsonObj.tag - The HTML tag name.
 * @param {String} jsonObj.text - The text content of the tag.
 * @param {Object} jsonObj.attr - The object containing attributes of the tag.
 * @param {Object[]} [jsonObj.childs] - An optional array of child objects representing nested HTML elements.
 * @param {Object} [jsonObj.child] - An optional child object representing a nested HTML element.
 * @param {Node} [jsonObj.Node] - An optional existing DOM node to be appended to the fragment.
 * @throws {Error} Will throw an error if the jsonObj parameter is not an object or if the object key is not a string.
 * @throws {Error} Will throw an error if the 'childs' parameter is not an array.
 * @throws {Error} Will throw an error if the 'child' parameter is not an object.
 * @returns {DocumentFragment} The newly created document fragment.
 */
export function fragmentBuilder(jsonObj) {
	if (typeof jsonObj !== 'object') {
		throw new Error('jsonObj must be an object');
	}

	const fragment = document.createDocumentFragment();

	for (const [key, value] of Object.entries(jsonObj)) {

		if (typeof key === 'string') {
			if (key === 'tag') {
				fragment.appendChild(document.createElement(value));
			} else if (key === 'text') {
				if (fragment.lastElementChild) {
					fragment.lastElementChild.appendChild(document.createTextNode(value));
				} else {
					fragment.appendChild(document.createTextNode(value));
				}
			} else if (key === 'attr') {
				const element = fragment.lastElementChild;
				for (const [attrName, attrValue] of Object.entries(value)) {
					element.setAttribute(attrName, attrValue);
				}
			} else if (key === 'childs') {
				if (Array.isArray(value)) {
					for (const childObj of value) {
						const childFragment = fragmentBuilder(childObj);
						fragment.lastElementChild.appendChild(childFragment);
					}
				} else {
					throw new Error('Childs must be an array');
				}
			}else if(key === 'child'){
				if (typeof value === 'object') {
					const childFragment = fragmentBuilder(value);
					fragment.lastElementChild.appendChild(childFragment);
				} else {
					throw new Error('Child must be an object');
				}
			}
			else if (key === 'Node') {
				if (value instanceof DocumentFragment || value instanceof Element || value instanceof Text) {
					fragment.appendChild(value);
				} else {
					throw new Error('Node must be a DocumentFragment, Element, or Text');
				}
			}
		}else{
			throw new Error('Object key must be a string');
		}
	}

	return fragment;
}