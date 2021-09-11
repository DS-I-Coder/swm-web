/*
    이거 없애도 되는지 확신이 안섬.
*/


// 서버로부터의 메시지 처리
socket.on('message', message => {
  console.log('Message received: ' + message.event);

  switch (message.event) {
    case 'newUserJoined':
      newUserAlert(message);
      if (message.hostid === message.userid) {
        host = message.hostid;
        receiveVideo(message.userid, message.username);
      } else {
        const user = {
          userid: message.userid,
          username: message.username,
        }
        participants[message.userid] = user;
      }
      break;
    case 'connected':
      host = message.hostid;
      connectPeer(message.userid, message.existingUsers);
      break;
    case 'sdpAnswer':
      addSdpAnswer(message.senderid, message.sdpAnswer);
      break;
    case 'candidate':
      addIceCandidate(message.userid, message.candidate);
      break;
    case 'userDisconnected':
      userDisconnected(message.userid);
      break;
      //어딘가 쓸만한가 하여 냅둠.
    // case 'warn':
    //   swal({
    //     title: "경고",
    //     text: "학생! 경고입니다!",
    //     icon: "warning",
    //     button: "확인",
    //   });
    //   break;

    case 'micON': //이거 마이크 버튼은 아닌 거 같은데 일단 냅둠. 
      micON(message.speakerid);
      break;

    case 'closeRoom':
      closeRoom();
      break;
  }
});