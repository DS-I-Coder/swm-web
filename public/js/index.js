const createRoomBtn = document.getElementById('createRoom');
const joinRoomBtn = document.getElementById('joinRoom');
const input = document.getElementById('input');
const joinBtn = document.getElementById('join');
const roomIDInput = document.getElementById('roomID');
const speakerBtn = document.getElementById('speaker');

//스터디룸 생성 버튼 -> 스터디룸 정보 설정 -> 생성 완료
createRoomBtn.addEventListener('click', () => {
    location.href = "/room/roominfo";
});

speakerBtn.addEventListener('click', () => {
    const roomID = roomIDInput.value;
    if (roomID) {
        location.href = `/room/${roomID}/mobile`;
    }
})

joinBtn.addEventListener('click', () => {
    joinRoom();
});

function joinRoom() {
    const roomID = roomIDInput.value;
    if (roomID) {
        location.href = `/room/${roomID}`;
    }
}