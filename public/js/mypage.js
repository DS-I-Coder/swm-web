const deleteBtn = document.getElementById('delete');


function deleteClicked(rID){
  if(confirm("정말로 삭제하시겠습니까?")==true){
    
    location.href = `/delete/${rID}`
    alert("삭제되었습니다!");
  }
}

/*??왜 안됌.. */
window.onhashchange  = function() {
  console.log("testsetset")
  location.href = '/main';
}