console.log('Call.js running');

const callwindow = document.querySelector('.callWindow');
const callButton = document.getElementById('call');
const minimizeCallButton = document.getElementById('minimizeCall');
//const toggleAudioButton = document.getElementById('toggleAudio');
const toggleVideoButton = document.getElementById('toggleVideo');
const dropCallButton = document.getElementById('dropCall');
const participents = document.querySelector('.participents');
const callSocket = io('/call');
const myCallStatus = {
    video: false,
    audio: true
}

let SIGNALING_SERVER = window.location.origin;
let USE_AUDIO = true;
let USE_VIDEO = true;
let DEFAULT_CHANNEL = 'call';
let MUTE_AUDIO_BY_DEFAULT = false;

const servers = {
    iceServers: [
        {
            urls: ['stun:stun1.1.google.com:19302', 'stun:stun2.1.google.com:19302'],
        },
    ],
    iceCandidatePoolSize: 10,
};

let signaling_socket = null;   /* our socket.io connection to our webserver */
let local_media_stream = null; /* our own microphone / webcam */
let peers = {};                /* keep track of our peer connections, indexed by peer_id (aka socket.io id) */
let peer_media_elements = {};  /* keep track of our <video>/<audio> tags, indexed by peer_id */



let callTimer;
const myVideo = document.createElement('video');
myVideo.classList.add('myCall');
myVideo.classList.add('caller');
//myVideo.classList.add('caller');
myVideo.muted = true;
myVideo.src = '';
myVideo.dataset.uid = myId;


const activeCallerMap = new Map();

function addVideoStream(video, stream, name = "Unknown", id){
    window.localStream = stream;
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    console.log(video);
    if (!activeCallerMap.has(id)){
        const Call = document.createElement('div');
        Call.classList.add('caller');
        const uname = document.createElement('div');
        uname.classList.add("name");
        uname.textContent = name;
        Call.append(uname);
        Call.append(video);
        participents.append(Call);
        activeCallerMap.set(id, true);
    }else{
        console.log('Already in call');
    }
}




/*
async function initiateCall(){
    if (navigator.mediaDevices){
        localstream = await navigator.mediaDevices.getUserMedia({video: myCallStatus.video, audio: myCallStatus.audio});
        remotestream = new MediaStream();

        localstream.getTracks().forEach((track) => {
            pc.addTrack(track, localstream);
        });

        pc.ontrack = event => {
            event.streams[0].getTracks().forEach(track => {
                remotestream.addTrack(track);
            });
        };

        myVideo.srcObject = localstream;
        remoteVideo.srcObject = remotestream;

        pc.onicecandidate = event => {
            event.candidate && offerCandidates.add(event.candidate.toJSON());
        };

        const offerDescription = await pc.createOffer();
        await pc.setLocalDescription(offerDescription);

        const offer = {
            sdp: offerDescription.sdp,
            type: offerDescription.type
        };

        //send the offer to other clients


    }else{ 
        console.log('not supported!');
    }
}

//listen for a call
callSocket.on('callDoc', (data) => {
    if (!pc.currentRemoteDescription && data?.answer){
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerDescription);
    }
});

callSocket.on('answerCandidates', (data) => {
    data.forEach((change) => {
        if (change.type === 'added'){
            const candidate = new RTCIceCandidate()
        }
    });
});
*/

function initiateCall(){
    if (navigator.mediaDevices){
        navigator.mediaDevices.getUserMedia(
            {
                video: myCallStatus.video,
                audio: myCallStatus.audio
            }
        ).then( stream => {
            addVideoStream(myVideo, stream, myName, myId);
        });
    }else{ 
        console.log('not supported!');
    }
}

/*
function toggleAudio(){
    if (toggleAudioButton.querySelector('i').classList.contains('fa-microphone-slash')){ //if true then audio muted
        toggleAudioButton.querySelector('i').classList.replace('fa-microphone-slash', 'fa-microphone');
        myCallStatus.audio = true;
        initiateCall();
        console.log('audio unmuted');
    }else{
        toggleAudioButton.querySelector('i').classList.replace('fa-microphone', 'fa-microphone-slash');
        myCallStatus.audio = false;
        localStream.getAudioTracks()[0]?.stop();
        console.log('audio muted');
    }
}
*/
function toggleVideo(){
    if (toggleVideoButton.querySelector('i').classList.contains('fa-video-slash')){ //if true then video off
        toggleVideoButton.querySelector('i').classList.replace('fa-video-slash', 'fa-video');
        console.log('video on');
        myCallStatus.video = true;
        initiateCall();
    }else{
        toggleVideoButton.querySelector('i').classList.replace('fa-video', 'fa-video-slash');
        myCallStatus.video = false;
        localStream.getVideoTracks()[0]?.stop();
        console.log('video off');
    }
}

function dropCall(){
    callwindow.classList.remove('active');
    localStream.getVideoTracks()[0]?.stop();
    localStream.getAudioTracks()[0]?.stop();
    myVideo.src = '';
    document.getElementById('callDuration').textContent = '00:00:00';
    clearTimeout(callTimer);
    document.querySelectorAll('.caller').forEach(item => {
        item.remove();
    });
    activeCallerMap.delete(myId);
    console.log('Call ended');
}

function timeFormat(secs){
    const pad = (n) => n < 10 ? `0${n}` : n;
  
    const h = Math.floor(secs / 3600);
    const m = Math.floor(secs / 60) - (h * 60);
    const s = Math.floor(secs - h * 3600 - m * 60);
  
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

callButton.addEventListener('click', () => {
    console.log("Starting call...");
    callwindow.classList.add('active');
    initiateCall();
    let duration = document.getElementById('callDuration');
    let start = 0;
    callTimer = setInterval(() => {
        start ++;
        duration.textContent = timeFormat(start);
    }, 1000);
});

dropCallButton.addEventListener('click', dropCall);

//toggleAudioButton.addEventListener('click', toggleAudio);
toggleVideoButton.addEventListener('click', toggleVideo);

minimizeCallButton.addEventListener('click', () => {
    console.log(minimizeCallButton.querySelector('i').classList);
    if (minimizeCallButton.querySelector('i').classList.contains('fa-minimize')){ //full window if true
        document.querySelector('.callWindow').classList.add('min');
        minimizeCallButton.querySelector('i').classList.replace('fa-minimize', 'fa-maximize');
        document.querySelector('.participents').style.gridTemplateColumns = 'repeat(auto-fit,minmax(50px,1fr))';
        console.log('minimizing call window');
    }else{
        minimizeCallButton.querySelector('i').classList.replace( 'fa-maximize', 'fa-minimize');
        document.querySelector('.callWindow').classList.remove('min');
        document.querySelector('.participents').style.gridTemplateColumns = 'repeat(auto-fit,minmax(140px,1fr))';
        console.log('maximizing call window');
    }
});