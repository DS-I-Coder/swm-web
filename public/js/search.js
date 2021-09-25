const join = document.getElementById('roomImg');
// 일단은 사진을 클릭하면

// var inputElement = document.createElement('div');
// inputElement.id = "roomImg"
// inputElement.addEventListener('click', function(){
//     gotoNode(room.is);
// });

// ​document.body.appendChild(inputElement);​

/* 방 입장 */
function joinRoom(uuid, pw) {

  /* 바말벙 */
  if (pw != "") {
    swal.fire({
      // title: "",
      text: "비밀번호를 입력하세요",
      input: 'password',
      showCancelButton: true, // TODO 취소 버튼 눌렀을 때도, 폼이 제출됨.
      inputPlaceholder: "비밀번호를 입력하세요"
      })
      .then ((inputVal)=> {
        console.log(inputVal.value)
        console.log(pw)

        if (inputVal.value == String(pw)){
          location.href = `/room/${uuid}`;
        }else{
          Swal.fire({
            icon: 'error',
            text: '비밀번호가 틀렸습니다!'
          })
          return false
        }

      })
  }
  /* 공개방 */
  else{
    location.href = `/room/${uuid}`;
  }
}