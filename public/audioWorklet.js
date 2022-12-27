//write the class for the audio worklet processor js file
class Visualizer extends AudioWorkletProcessor {
	process(inputs) {
		const input = inputs[0];
		const inputChannel = input[0];
		const inputLength = inputChannel.length;
		const sum = inputChannel.reduce((acc, sample) => acc + sample * sample, 0);
		const rms = Math.sqrt(sum / inputLength);
		const amplitude = rms * 1000;
		//send the amplitude to the main thread
		this.port.postMessage(amplitude);
		return true;
	}
}

  
registerProcessor('audio-worklet-processor', Visualizer);
   

//console.log('WorkletProcessor loaded..!');