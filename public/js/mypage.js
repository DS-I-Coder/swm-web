const deleteBtn = document.getElementById('delete');


function deleteClicked(rID){
  if(confirm("정말로 삭제하시겠습니까?")==true){
    
    location.href = `/delete/${rID}`
    alert("삭제되었습니다!");
  }
}

function toHHMMSS(sec_num) {
  //var sec_num = parseInt(this, 10); // don't forget the second param
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  var seconds = sec_num - (hours * 3600) - (minutes * 60);

  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return hours + ':' + minutes + ':' + seconds;
}