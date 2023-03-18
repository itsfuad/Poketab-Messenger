/**
 * 
 * @param {string} path 
 * @returns string
 */
export function sanitizeImagePath(path){
	//path regex will contain normal characters, numbers, underscores, hyphens and base64 characters
	const regex = /[<>&'"\s]/g;

	if (!path.match(regex)){
		return path;
	}else{
		return '/images/danger-mini.webp';
	}
}

/**
 * Removes all charecter [<, >, ', "] from string
 * @param {string} str The string to sanitize
 * @returns {string} Removed all charecter [<, >, ', "] from string
 */
export function sanitize(str){
	if (str == null || str == ''){
		return '';
	}
	str = str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/\//g, '&#x2F;');
	return str;
}