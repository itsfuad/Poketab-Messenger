const startCallButton = document.getElementById('startCallBtn');


startCallButton.addEventListener('click', () => {

	console.log('Starting call...');

	// Get access to the microphone
	navigator.mediaDevices.getUserMedia({ audio: true })
		.then((stream) => {
			console.log('Got MediaStream:', stream);

			const mediaStream = new MediaStream(stream);

			const turnServer = 'turn:localhost:3478';
			const username = 'user1';
			const credential = 'password1';

			const iceServers = [
				{
					urls: [turnServer],
					username: username,
					credential: credential,
				},
			];

			const configuration = {
				iceServers: iceServers
			};

			const localPeerConnection = new RTCPeerConnection(configuration);
			console.log('Created local peer connection object localPeerConnection:', localPeerConnection);

			localPeerConnection.addStream(mediaStream);
			console.log('Added local stream to localPeerConnection');

			const remotePeerConnection = new RTCPeerConnection(configuration);
			console.log('Created remote peer connection object remotePeerConnection:', remotePeerConnection);

			remotePeerConnection.onaddstream = (e) => {
				console.log('remotePeerConnection received the stream:', e.stream);
			};

			localPeerConnection.onicecandidate = (e) => {
				if (e.candidate) {
					remotePeerConnection.addIceCandidate(new RTCIceCandidate(e.candidate));
					console.log('Local ICE candidate:', e.candidate);
				}
			};

			remotePeerConnection.onicecandidate = (e) => {
				if (e.candidate) {
					localPeerConnection.addIceCandidate(new RTCIceCandidate(e.candidate));
					console.log('Remote ICE candidate:', e.candidate);
				}
			};


		})
		.catch((error) => {
			console.error('Error accessing media devices.', error);
		});
});