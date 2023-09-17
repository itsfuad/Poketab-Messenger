
/**
 * 
 * @param {string[]} array Array of reacts to process
 * @returns Map
 */
export function arrayToMap(array) {
	const map = new Map();
	array.forEach(element => {
		map.set(element.textContent, map.get(element.textContent) + 1 || 1);
	});
	return map;
}

/**
 * 
 * @param {number} timestamp 
 * @returns {string}
 */
export function getFormattedDate(timestamp) {
	timestamp = parseInt(timestamp);
	const currentTime = Date.now();
	const differenceInSeconds = Math.floor((currentTime - timestamp) / 1000);

	if (differenceInSeconds === 0) {
		return 'Just now';
	} else if (differenceInSeconds < 60) {
		return `${differenceInSeconds} secs ago`;
	} else if (differenceInSeconds < 120) {
		return '1 min ago';
	} else if (differenceInSeconds < 600) {
		return `${Math.floor(differenceInSeconds / 60)} mins ago`;
	} else {
		return new Intl.DateTimeFormat('default', {
			hour: 'numeric',
			minute: 'numeric'
		}).format(timestamp);
	}
}


/**
 * 
 * @param {Map} userTypingMap 
 * @returns string
 */
export function getTypingString(userTypingMap){
	if (userTypingMap.size > 0){
		const array = Array.from(userTypingMap.values());
		let string = '';
      
		if (array.length >= 1){
			if (array.length == 1){
				string = array[0];
			}
			else if (array.length == 2){
				string = `${array[0]} and ${array[1]}`;
			}
			else if (array.length ==  3){
				string = `${array[0]}, ${array[1]} and ${array[2]}`;
			}
			else{
				string = `${array[0]}, ${array[1]}, ${array[2]} and ${array.length - 3} other${array.length - 3 > 1 ? 's' : ''}`;
			}
		}
		string += `${array.length > 1 ? ' are ': ' is '} typing`;
		return string;
	}else{
		return '';
	}
}


/**
 * Returns a string in the format "mm:ss" representing the remaining time
 * @param {number} totalTime - the total time in seconds
 * @param {number} elapsedTime - the elapsed time in seconds
 * @returns {string} - a string in the format "mm:ss"
 */
export function remainingTime(totalTime, elapsedTime) {
	// Check if totalTime and elapsedTime are finite numbers and if totalTime is greater than 0
	if(isFinite(totalTime) && totalTime > 0 && isFinite(elapsedTime)){
		// Calculate the remaining time
		const remaining = Math.floor(totalTime) - Math.floor(elapsedTime);
		// Calculate the minutes and seconds from the remaining time
		const minutes = Math.floor(remaining / 60);
		const seconds = Math.floor(remaining % 60);
		// Return the remaining time in the format "mm:ss"
		return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
	}else{
		// Return "00:00" if totalTime and elapsedTime are not valid numbers
		return '00:00';
	}
}

/**
 * 
 * @param {string} filename 
 * @returns string
 */
export function shortFileName(filename){
	if (filename.length > 30){
		//then shorten the filename as abc...[last10chars]
		filename = filename.substring(0, 10) + '...' + filename.substring(filename.length - 10, filename.length);
	}
	return filename;
}