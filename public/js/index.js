const createRoomBtn = document.getElementById('createRoom');
const joinRoomBtn = document.getElementById('joinRoom');
const input = document.getElementById('input');
const joinBtn = document.getElementById('join');
const roomIDInput = document.getElementById('roomID');
const speakerBtn = document.getElementById('speaker');
const searchBtn = document.getElementById('searchbtn');

//스터디룸 생성 버튼 -> 스터디룸 정보 설정 -> 생성 완료
createRoomBtn.addEventListener('click', () => {
    location.href = "/room/roominfo";
});

joinBtn.addEventListener('click', () => {
    joinRoom();
});

function joinRoom() {
    // TODO: roomTitle로 db에서 uuidv4 주소 찾기?

    const roomID = roomIDInput.value;
    if (roomID) {
        location.href = `/room/${roomID}`;
    }
}

//검색버튼
searchBtn.addEventListener('click', () =>{
    lacation.href = "/search";
});