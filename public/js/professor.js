faceapi.nets.tinyFaceDetector.loadFromUri('/js/util/models');
faceapi.nets.faceLandmark68Net.loadFromUri('/js/util/models');
faceapi.nets.faceRecognitionNet.loadFromUri('/js/util/models');
faceapi.nets.faceExpressionNet.loadFromUri('/js/util/models');


const myVideo = document.getElementById('my-cam');
const userName = USER_NAME;
const participants = {};
const context = {}; // 내 비디오 제외 원격 비디오 2d context를 userid별로 받음.
var interval = {};
const videoGrid = document.getElementById('video-grid');


const socket = io();

// Promise.all([
//     faceapi.nets.tinyFaceDetector.loadFromUri('/js/util/models'),
//     faceapi.nets.faceLandmark68Net.loadFromUri('/js/util/models'),
//     faceapi.nets.faceRecognitionNet.loadFromUri('/js/util/models'),
//     faceapi.nets.faceExpressionNet.loadFromUri('/js/util/models')
// ]).then(play) //connect 오류

//
const constraints = {
    audio: true,
    video: {
        mandatory: {
            maxWidth: 720,
            maxFrameRate: 30,
            minFrameRate: 15
        }
    }
};

// 소켓 연결이 완료되면 서버로 join 메시지를 보내서 처리
socket.emit('message', {
    event: 'join',
    //isHost: true,
    username: userName,
    roomid: ROOM_ID,
});

// 유저 연결이 끊어졌을 경우 비디오 처리를 하는 메소드
function userDisconnected(userid) {
    if (participants[userid]) {
        const video = document.getElementById(userid);
        video.parentElement.remove();

        clearInterval(interval[userid]);
        context[userid].context2d.clearRect(0, 0, context[userid].width, context[userid].height);
        context[userid] = null;


        // TODO: 메세지 오류 수정
        // const msg = document.createElement('div');
        // msg.innerText = `${participants[userid].username}님이 퇴장하셨습니다.`;
        // msg.classLists.add('system');
        // chatView.append(msg);

        delete participants[userid];
    }
}

// 원격 연결로부터 비디오 수신
function receiveVideo(userid, username) {
    // 페이지에 비디오 생성
    const user = {
        id: userid,
        username: username,
        rtcPeer: null
    }
    participants[user.id] = user;

    const template = `
    <video id = "${userid}" preload="metadata" autoplay muted></video>`;
    const container = document.createElement('div');
    container.innerHTML = template
    videoGrid.appendChild(container)
    const video = container.querySelector('video');
    participants[user.id].video = video;


    const options = {
        remoteVideo: video,
        onicecandidate: onIceCandidate
    }

    // user의 rtcPeer를 생성.
    // receiveVideo는 비디오를 받아오는 역할이므로 Receive only로 생성
    user.rtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options,
        function (err) {
            if (err) {
                return console.error(err);
            }
            this.generateOffer(onOffer);
        } // offer를 생성
    );
    const onOffer = function (err, offer, wp) {
        console.log('sending offer');
        // offer를 넣은 메시지를 소켓을 통해 전달
        const message = {
            event: 'offer',
            userid: user.id,
            roomid: ROOM_ID,
            sdpOffer: offer
        }
        sendMessage(message);
    }

    function onIceCandidate(candidate, wp) {
        console.log('sending ice candidates');
        const message = {
            event: 'candidate',
            userid: user.id,
            roomid: ROOM_ID,
            candidate: candidate
        }
        sendMessage(message);
    }

    /* video play 이벤트 */
    video.addEventListener('play', () => {
        console.log("remote video")
        const canvas = faceapi.createCanvasFromMedia(video)
        document.body.append(canvas)
        const displaySize = {
            width: video.videoWidth,
            height: video.videoHeight
        }
        faceapi.matchDimensions(canvas, displaySize)
        //video의 좌측 상단 위치. (그냥 myVideo에서 바로 가지고 오면 제대로된 값 출력 못함.)
        var x = video.getBoundingClientRect().x
        var y = video.getBoundingClientRect().y

        //이미지가 보여질 캔버스의 스타일 조정으로 => 비디오랑 위치 맞춤.
        canvas.style.left = `${x}px`
        canvas.style.top = `${y}px`
        //let context = canvas.getContext('2d');
        context[userid] = {
            context2d: canvas.getContext('2d'),
            width: canvas.width,
            height: canvas.height
        }
        console.log('check////');
        const waitingImage = new Image();
        waitingImage.src = '/js/util/emoji/rec.png';
        waitingImage.addEventListener('load', e => {
            console.log('waiting image load')
            context[userid].context2d.clearRect(0, 0, canvas.width, canvas.height);
            context[userid].context2d.drawImage(waitingImage, 0, 0, video.videoWidth, video.videoHeight);
        });

        interval[userid] = setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
            const resizedDetections = faceapi.resizeResults(detections, displaySize)

            if (detections.length > 0) { // 감지가 됐을 때 
                detections.forEach(element => {
                    video.style.filter = "";
                    let status = "";
                    let valueStatus = 0.0;

                    for (const [key, value] of Object.entries(element.expressions)) {
                        if (value > valueStatus) {
                            status = key;
                            valueStatus = value;
                        }
                    }
                    const {
                        _x,
                        _y
                    } = resizedDetections[0].detection._box;
                    const _width = resizedDetections[0].landmarks.imageWidth;
                    const _height = resizedDetections[0].landmarks.imageHeight;

                    const img = new Image();
                    img.src = '/js/util/emoji/smile.png';

                    img.addEventListener('load', e => {
                        context[userid].context2d.clearRect(0, 0, canvas.width, canvas.height);
                        context[userid].context2d.drawImage(img, _x - _height / 4, _y - _height / 1.8, _width * 1.5, _height * 1.5);
                    });

                });
            } else { // 감지 안됐을 때 

                /* 이모지 사용 */
                // const img = new Image();
                // img.src = '/js/util/emoji/wait.png';

                // img.addEventListener('load', e => {
                //     context[userid].context2d.clearRect(0, 0, canvas.width, canvas.height);
                //     context[userid].context2d.drawImage(img, 0, 0, canvas.width, canvas.height);
                // });

                /* 블러 처리 */
                context[userid].context2d.clearRect(0, 0, canvas.width, canvas.height);
                video.style.filter = "blur(15px)";
            }

        }, 100)


    })
}
/*****receive 원격 비디오 수신 */

// existingParticipants 이벤트를 수신했을 때 호출
// 새 참여자가 참여할 때마다 room의 참여자 목록을 받아서 각각의 user에 대해 receiveVideo 호출
function connect(userid, existingUsers) {
    console.log('professor connect');
    const user = {
        id: userid,
        username: userName,
        video: myVideo,
        rtcPeer: null
    }

    participants[user.id] = user;

    const options = {
        localVideo: myVideo,
        mediaConstraints: constraints,
        onicecandidate: onIceCandidate
    }

    // onExistingParticipants는 sendonly
    user.rtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options,

        function (err) {
            if (err) {
                user.rtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly({
                    localVideo: myVideo,
                    mediaConstraints: {
                        audio: false,
                        video: false
                    },
                    onicecandidate: onIceCandidate
                });
                //return console.error(err);
            }
            this.generateOffer(onOffer);
            console.log('professor websedonly')
        }

    );

    // exisitingUsers 목록의 모든 user들을 대상으로 receiveVideo 호출
    existingUsers.forEach(function (element) {
        receiveVideo(element.id, element.name);
    });

    const onOffer = function (err, offer, wp) {
        console.log('sending offer');
        const message = {
            event: 'offer',
            userid: user.id,
            roomid: ROOM_ID,
            isHost: true,
            sdpOffer: offer
        }
        sendMessage(message);
    }

    function onIceCandidate(candidate, wp) {
        console.log('sending ice candidates');
        const message = {
            event: 'candidate',
            userid: user.id,
            roomid: ROOM_ID,
            candidate: candidate
        }
        sendMessage(message);
    }
}

// 서버에서 sdpAnswer를 보냈을 때 받아서 처리
function addSdpAnswer(senderid, sdpAnswer) {
    participants[senderid].rtcPeer.processAnswer(sdpAnswer);
}

// rtcPeer에 icecandidate를 추가
function addIceCandidate(userid, candidate) {
    participants[userid].rtcPeer.addIceCandidate(candidate);
}




// 메시지를 보내는 메서드
function sendMessage(message) {
    console.log('sending ' + message.event + ' message to server');
    socket.emit('message', message);
}

// 새 참가자가 입장하면 채팅으로 알림
function newUserAlert(message) {
    const msg = document.createElement('div');
    msg.innerText = `${message.username}님이 입장하셨습니다.`;
    msg.classList.add('system');
    chatView.append(msg);
}


/* */
myVideo.addEventListener('play', () => {
    console.log('mycam event listener')
    const canvas = faceapi.createCanvasFromMedia(myVideo)
    document.body.append(canvas)
    const displaySize = {
        width: myVideo.videoWidth,
        height: myVideo.videoHeight
    }
    faceapi.matchDimensions(canvas, displaySize)

    //video의 좌측 상단 위치. (그냥 myVideo에서 바로 가지고 오면 제대로된 값 출력 못함.)
    var x = myVideo.getBoundingClientRect().x
    var y = myVideo.getBoundingClientRect().y

    //이미지가 보여질 캔버스의 스타일 조정으로 => 비디오랑 위치 맞춤.
    canvas.style.left = `${x}px`
    canvas.style.top = `${y}px`

    let context = canvas.getContext('2d');

    //대기시 
    const waitingImage = new Image();
    waitingImage.src = '/js/util/emoji/rec.png';
    waitingImage.addEventListener('load', e => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(waitingImage, 0, 0, myVideo.videoWidth, myVideo.videoHeight);
        // context.drawImage(waitingImage, 0, 0, 300, 300);
    });

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(myVideo, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)

        if (detections.length > 0) { // 감지가 됐을 때 
            detections.forEach(element => {
                myVideo.style.filter = ""; // 블러 제거
                let status = "";
                let valueStatus = 0.0;

                for (const [key, value] of Object.entries(element.expressions)) {
                    if (value > valueStatus) {
                        status = key;
                        valueStatus = value;
                    }
                }

                const {
                    _x,
                    _y
                } = resizedDetections[0].detection._box;
                const _width = resizedDetections[0].landmarks.imageWidth;
                const _height = resizedDetections[0].landmarks.imageHeight;

                const img = new Image();
                img.src = '/js/util/emoji/smile.png';

                img.addEventListener('load', e => {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(img, _x - _height / 4, _y - _height / 1.8, _width * 1.5, _height * 1.5);
                });

            });
        } else { // 감지 안됐을 때 

            /* 이모지 사용 */

            // const img = new Image();
            // img.src = '/js/util/emoji/wait.png';

            // img.addEventListener('load', e => {
            //     context.clearRect(0, 0, canvas.width, canvas.height);
            //     context.drawImage(img, 0, 0, canvas.width, canvas.height);
            // });

            /* 블러처리 */
            context.clearRect(0, 0, canvas.width, canvas.height);
            myVideo.style.filter = "blur(15px)";
        }
    }, 100)
})