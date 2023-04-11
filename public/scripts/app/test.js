	//console.log(evt.inputType);

	//console.log('Input');
	if (!textbox.dataset.rawData){
		textbox.dataset.rawData = '';
	}

	//caret index from the end
	const caretPos = window.getSelection().getRangeAt(0).startOffset;
	console.log(`Caret current position: ${caretPos}`);
	const caretIndex = textbox.dataset.rawData.length-caretPos;
	console.log(`Caret index: ${caretIndex}`);
	//set caret position to the end with same last index
	const caretLastIndex = textbox.dataset.rawData.length-caretIndex;
	console.log(`Caret last index: ${caretLastIndex}`);

	if (evt.inputType == 'insertText'){
		//insert after caret
		textbox.dataset.rawData = textbox.dataset.rawData.slice(0, caretPos-1) + evt.data + textbox.dataset.rawData.slice(caretPos-1, textbox.dataset.rawData.length);
	}else if (evt.inputType == 'deleteContentBackward'){
		textbox.dataset.rawData = textbox.dataset.rawData.slice(0, caretPos) + textbox.dataset.rawData.slice(caretPos+1, textbox.dataset.rawData.length);
	}else if (evt.inputType == 'deleteContentForward'){
		const caretPos = window.getSelection().getRangeAt(0).startOffset;
		textbox.dataset.rawData = textbox.dataset.rawData.slice(0, caretPos) + textbox.dataset.rawData.slice(caretPos+1, textbox.dataset.rawData.length);
	}else if (evt.inputType == 'insertLineBreak'){
		const caretPos = window.getSelection().getRangeAt(0).startOffset;
		textbox.dataset.rawData = textbox.dataset.rawData.slice(0, caretPos) + '\n' + textbox.dataset.rawData.slice(caretPos, textbox.dataset.rawData.length);
	}

	const text = textbox.dataset.rawData;
	const parsed = messageParser.parseKeepDelimiters(text);
	textbox.innerHTML = parsed;

	//caret reposition
	const range = document.createRange();
	const sel = window.getSelection();
	range.setStart(textbox.childNodes[0], caretLastIndex);
	range.collapse(true);
	sel.removeAllRanges();
	sel.addRange(range);