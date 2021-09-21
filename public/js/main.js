const usernameBtn = document.getElementById('username');
const logout = document.getElementById('logout');

usernameBtn.addEventListener('click', () => {
  if (logout.style.display == 'block') {
    logout.style.display = "none"
  } else {
    logout.style.display = "block"
  }
})