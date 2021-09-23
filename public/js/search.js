const join = document.getElementById('roomImg');
// 일단은 사진을 클릭하면

// var inputElement = document.createElement('div');
// inputElement.id = "roomImg"
// inputElement.addEventListener('click', function(){
//     gotoNode(room.is);
// });

// ​document.body.appendChild(inputElement);​

/* 방 입장 */
function joinRoom(uuid) {

  //방 정보 가져오고
  console.log(uuid)
  // 방 정보가 있다면 그 방 주소로
  if (false){
    location.href = `/room/${uuid}`;
  }
}