//enable strict mode
'use strict';

export function processAudioStream(stream){
	const audioContext = new AudioContext();
	//register the audio worklet
	audioContext.audioWorklet.addModule('audioWorklet.js')
		.then(() => {
			//console.log('Audio Worklet registering..');
			//create an audio worklet node
			const audioWorkletNode = new AudioWorkletNode(audioContext, 'audio-worklet-processor');
			//create a media stream source
			const mediaStreamSource = audioContext.createMediaStreamSource(stream);
			//connect the media stream source to the audio worklet node
			mediaStreamSource.connect(audioWorkletNode);
			//connect the audio worklet node to the destination
			audioWorkletNode.connect(audioContext.destination);

			//if the audio worklet node gets a message
			audioWorkletNode.port.onmessage = (e) => {
				const amplitude = e.data;
				document.documentElement.style.setProperty('--amplitude', amplitude + 'px');
			};

			//if the user stops the audio stream
			stream.oninactive = function(){
				audioContext.close();
				audioWorkletNode.disconnect();
				mediaStreamSource.disconnect();
				document.documentElement.style.setProperty('--amplitude', '0px');
			};
		})
		.catch((err) => {
			console.log('The following error occured: ' + err);
		});
}