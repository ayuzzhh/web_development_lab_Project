const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    try {
      const data = await callServer('../Backend/users.php?action=login', 'POST', {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
      });
      saveUser(data.user);
      location.href = data.user.role === 'admin' ? 'admin-products.html' : 'dashboard.html';
    } catch (err) {
      showMessage('loginMessage', err.message, true);
    }
  });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const password = document.getElementById('registerPassword').value;
    if (password !== document.getElementById('registerPassword2').value) {
      showMessage('registerMessage', 'The two passwords do not match.', true);
      return;
    }
    try {
      const data = await callServer('../Backend/users.php?action=register', 'POST', {
        name: document.getElementById('registerName').value,
        email: document.getElementById('registerEmail').value,
        password: password
      });
      saveUser(data.user);
      location.href = 'dashboard.html';
    } catch (err) {
      showMessage('registerMessage', err.message, true);
    }
  });
}
