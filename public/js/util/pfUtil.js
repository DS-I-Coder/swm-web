function addGreen(ele) {
    ele.classList.add('active-green');
}

function removeGreen(ele) {
    ele.classList.remove('active-green');
}

const exitRoomBtn = document.getElementById('out');

exitRoomBtn.addEventListener('click', () => {
    const t = '03:12'.split(":");

    // Convert list to numbers
    const a = t.map(numberAsString => parseInt(numberAsString));
    console.log(a[0]+a[1]);

    /*뒤로가기 버튼*/
    swal({
            title: "메인화면으로 돌아갑니다.",
            text: "정말 퇴장하시겠습니까?",
            icon: "warning",
            buttons: ['아니오', '예'],
            dangerMode: true,
        })
        .then((value) => {
            // if (value) {
            //     socket.emit('message', {
            //         event: 'closeRoom',
            //         roomid: ROOM_ID,
            //     });
            //     closeRoom();
            // }

            if (value) {
                // socket.emit('message', {
                //     // event: 'closeRoom',
                //     event: 'disconnect',
                //     //roomid: ROOM_ID,
                // });

                var time = document.getElementById('timerecord').innerText
                const arr = time.split(':').map(numberAsString => parseInt(numberAsString));
                socket.emit('disconnect')
                console.log(arr[0]*60 + arr[1])
                location.href = `/timeupdate/${arr[0]*60 + arr[1]}`;
                //closeRoom();
            }
        });
});

function closeRoom() {
    console.log('function closeRoom')
    swal({
            title: ".",
            text: "메인 화면으로 돌아갑니다.",
            button: "확인",
        })
        .then(() => {
            location.href = '/main';
        });
}

const fullscrBtn = document.getElementById('full-screen');

let screenMode = false;
fullscrBtn.addEventListener('click', () => {
    const mainLeft = document.getElementById('main-container-left');
    const mainRight = document.getElementById('main-container-right');
    if (screenMode) {
        screenMode = false;
        mainLeft.style = "width:80%";
        mainRight.style = "width:20% display:flex";
    } else {
        screenMode = true;

        mainLeft.style = "width:100%";
        mainRight.style = "display:none";

    }
})


//camera button
let cameraBtn = document.querySelector('#camera');
let screenBtn = document.querySelector('#screen');
const videoMode = {
    cameraOn: 'cameraOn',
    cameraOff: 'cameraOff',
    screenOn: 'screenOn',
    screenOff: 'screenOff'
}
let nowVideoMode = videoMode.cameraOn;


let cameraConstraint = {
    video: true
}

let screenConstraint = {
    video: {
        cursor: "always"
    },
    audio: false
};

addGreen(cameraBtn);
cameraBtn.addEventListener('click', () => {
    let localStream = participants[socket.id].rtcPeer.getLocalStream();
    let senders = participants[socket.id].rtcPeer.peerConnection.getSenders();

    switch (nowVideoMode) {
        case videoMode.cameraOn:
            nowVideoMode = videoMode.cameraOff;
            localStream.getVideoTracks()[0].enabled = false;
            removeGreen(cameraBtn);
            break;
        case videoMode.cameraOff:
            nowVideoMode = videoMode.cameraOn;
            localStream.getVideoTracks()[0].enabled = true;
            addGreen(cameraBtn);
            break;
        case videoMode.screenOff:
        case videoMode.screenOn:
            nowVideoMode = videoMode.cameraOn;
            getCameraTrack(cameraConstraint).then(track => changeTrack(track, localStream, senders));
            addGreen(cameraBtn);
            removeGreen(screenBtn);
            break;
    }

})


screenBtn.addEventListener('click', () => {
    let localStream = participants[socket.id].rtcPeer.getLocalStream();
    let senders = participants[socket.id].rtcPeer.peerConnection.getSenders();

    switch (nowVideoMode) {
        case videoMode.screenOff:
            nowVideoMode = videoMode.screenOn;
            localStream.getVideoTracks()[0].enabled = true;
            addGreen(screenBtn);
            break;
        case videoMode.screenOn:
            nowVideoMode = videoMode.screenOff;
            localStream.getVideoTracks()[0].enabled = false;
            removeGreen(screenBtn);
            break;
        case videoMode.cameraOff:
        case videoMode.cameraOn:
            nowVideoMode = videoMode.screenOn;
            getScreenTrack(screenConstraint).then(track => changeTrack(track, localStream, senders));
            addGreen(screenBtn);
            removeGreen(cameraBtn);
            break;
    }

})

function getCameraTrack(constraint) {
    return new Promise((resolve, reject) => {
        navigator.mediaDevices.getUserMedia(constraint)
            .then((_stream) => {
                resolve(_stream.getVideoTracks()[0]);
            })
    })
}

function getScreenTrack(constraint) {
    return new Promise((resolve, reject) => {
        navigator.mediaDevices.getDisplayMedia(constraint)
            .then((_stream) => {
                resolve(_stream.getVideoTracks()[0]);
            })
    })
}


function changeTrack(track, localStream, senders) {
    let oldTrack = localStream.getVideoTracks()[0];
    oldTrack.stop();
    console.log(oldTrack);
    localStream.addTrack(track);

    localStream.removeTrack(oldTrack);

    let sender = senders.find((s) => {
        return s.track == null;
    })
    sender.replaceTrack(track);
}

//audio controll

const micBtn = document.querySelector('#mic');
const silence = document.querySelector('#silence');
const audioMode = {
    audioOn: 'audioOn',
    audioOff: 'audioOff',
}
let nowAudioMode = audioMode.audioOn;
addGreen(micBtn);

micBtn.addEventListener('click', () => {
    let localStream = participants[socket.id].rtcPeer.getLocalStream();
    if (nowAudioMode == audioMode.audioOn) {
        nowAudioMode = audioMode.audioOff;
        localStream.getAudioTracks()[0].enabled = false;
        removeGreen(micBtn);
    } else {
        nowAudioMode = audioMode.audioOn;
        localStream.getAudioTracks()[0].enabled = true;
        addGreen(micBtn);
    }
})

function micON(speakerid) {
    if (speakerid === socket.id) {
        console.log('mic on');
        if (nowAudioMode === audioMode.audioOff) {
            nowAudioMode = audioMode.audioOn;
            let localStream = participants[socket.id].rtcPeer.getLocalStream();
            localStream.getAudioTracks()[0].enabled = true;
            addGreen(micBtn);
        }
    }
}

silence.addEventListener('click', () => {
    Object.keys(participants).forEach((id) => {
        if (id != socket.id) {
            socket.emit('message', {
                event: 'silence',
                userid: id
            })
        }
    })
})