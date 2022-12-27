/*
        function processAudioStream(stream){
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

            analyser.smoothingTimeConstant = 0.8;
            analyser.fftSize = 1024;

            microphone.connect(analyser);
            analyser.connect(javascriptNode);
            javascriptNode.connect(audioContext.destination);

            javascriptNode.onaudioprocess = () => {
                const array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);
                const values =  array.reduce((a, b) => a + b);
                const average = values / array.length;
                const amplitude = average * 2;
                document.documentElement.style.setProperty('--amplitude', amplitude + 'px');
            };

            //if the user stops the audio stream
            stream.oninactive = function(){
                if (audioContext){
                    audioContext.close();
                    javascriptNode.disconnect();
                     microphone.disconnect();
                    analyser.disconnect();
                    console.log('%cstopped audio stream', 'color: pink');
                    document.documentElement.style.setProperty('--amplitude', '0px');
                }
            }
        }
        */
        
//write relevant audioWorklet code here of the same function. register the worklet and use it in the processAudioStream function
function processAudioStream(stream){
	const audioContext = new AudioContext();
	//register the audio worklet
	audioContext.audioWorklet.addModule('audioWorklet.js')
		.then(() => {
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
				if (audioContext){
					audioContext.close();
					audioWorkletNode.disconnect();
					mediaStreamSource.disconnect();
					document.documentElement.style.setProperty('--amplitude', '0px');
				}
			};
		})
		.catch((err) => {
			console.log('The following error occured: ' + err);
		});
}