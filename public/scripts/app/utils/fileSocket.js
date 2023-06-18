//enable strict mode
'use strict';

import { io } from './../../../libs/socket.io.js';
import { myKey, myId, userInfoMap, fileBuffer, insertNewMessage, notifyUser, updateScroll, clearDownload } from './../app.js';
import { playIncomingSound } from './media.js';

//file socket to deliver file metadata [This is not used for file transfer, only for metadata. Files will be transferred using xhr requests]
/**
 * @type {SocketIOClient.Socket}
 */
export const fileSocket = io('/file');

export const incommingXHR = new Map();

//files metadata will be sent on different socket
fileSocket.on('connect', () => {
	console.log('%cConnection established to file relay server', 'color: deepskyblue;');
	fileSocket.emit('join', myKey);
});

//gets an intermediate thumbnail and file metadata
fileSocket.on('fileDownloadStart', (type, thumbnail, id, uId, reply, replyId, options, metadata) => {
	playIncomingSound();
	fileBuffer.set(id, {type: type, data: '', uId: uId, reply: reply, replyId: replyId, options: options, metadata: metadata});
	if (type === 'image'){
		insertNewMessage(thumbnail, type, id, uId, reply, replyId, options, metadata);
		const elem = document.getElementById(id).querySelector('.messageMain');
		setTimeout(() => {
			elem.querySelector('.image').style.filter = 'brightness(0.4) url(#sharpBlur)';
		}, 50);
	}else{
		insertNewMessage('', type, id, uId, reply, replyId, options, metadata);
		const elem = document.getElementById(id).querySelector('.messageMain');
		elem.querySelector('.progress').textContent = '↑ Uploading';
	}
	notifyUser({data: '', type: type[0].toUpperCase()+type.slice(1)}, userInfoMap.get(uId)?.username, userInfoMap.get(uId)?.avatar);
});

//if any error occurrs, the show the error
fileSocket.on('fileUploadError', (id) => {
	try{

		console.log(id);
		
		const element = document.getElementById(id).querySelector('.messageMain');
		const type = element.closest('.message').dataset.type; 
		let progressContainer;
		if (type === 'image'){
			progressContainer = element.querySelector('.circleProgressLoader .progressPercent');
		}else{
			progressContainer = element.querySelector('.progress');
		}

		console.log(progressContainer);

		if (progressContainer){
			progressContainer.textContent = 'Upload Error';
		}

		if (fileBuffer.has(id)){
			console.log('deleting file buffer for error');
			fileBuffer.delete(id);
		}

	}catch(e){
		console.log(e);
	}
});

//if the file has been uploded to the server by other users, then start downloading
fileSocket.on('fileDownloadReady', (id, downlink) => {
	if (!fileBuffer.has(id)){
		return;
	}
	const data = fileBuffer.get(id);
	const type = data.type;
	const element = document.getElementById(id).querySelector('.messageMain');
	let progressContainer;
	let progressText;
	//console.log(type);
	if (type === 'image'){
		progressContainer = element.querySelector('.circleProgressLoader');
		progressText = progressContainer.querySelector('.progressPercent');
	}else{
		progressContainer = element.querySelector('.progress');
		progressText = progressContainer;
	}

	//console.log(progressContainer);
	
	fileBuffer.delete(id);

	const xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
		if (xhr.readyState === XMLHttpRequest.OPENED){
			//console.log('opened connection to download file');
			incommingXHR.set(id, xhr);
		}
		if (xhr.readyState === XMLHttpRequest.DONE) {
			if(xhr.status === 200){
				//console.log('file download complete');
				incommingXHR.delete(id);
				const file = this.response;
				const url = URL.createObjectURL(file);

				if (element){

					clearDownload(element, url, type);
					fileSocket.emit('fileDownloaded', myId, myKey, id);
					if (type === 'image'){
						//update the reply thumbnails with the detailed image if exists
						document.querySelectorAll(`.messageReply[data-repid="${id}"]`)
							.forEach(elem => {
								elem.querySelector('.image').src = url;
								elem.querySelector('.image').style.filter = 'brightness(0.4) !important';
							});
					}
				}
			}
		}
	};


	xhr.open('GET', `${location.origin}/api/files/download/${myKey}/${downlink}/${myId}`, true);
	xhr.responseType = 'blob';


	xhr.onprogress = function(e) {
		if (e.lengthComputable && progressContainer) {
			const progress = Math.round((e.loaded / e.total) * 100);
			//console.log(progress);
			if (type == 'image'){
				progressContainer.querySelector('.animated')?.classList?.remove('inactive');
				progressContainer.style.strokeDasharray = `${(progress * 251.2) / 100}, 251.2`;
			}
			progressText.textContent = '↓ ' + Math.round(progress) + '%';
			if (progress === 100){
				type == 'image' ? progressContainer.querySelector('.animated').style.visibility = 'hidden' : null;
				progressText.textContent = 'Decoding...';
			}
		}
	};

	xhr.send();
	updateScroll();
});

//on disconnect
fileSocket.on('disconnect', () => {
	console.log('%cDisconnected from file relay server.', 'color: red;');
});