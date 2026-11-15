const user = requireLogin();

function showProfile() {
  const u = getUser();
  document.getElementById('welcomeName').textContent = u.name;
  document.getElementById('pName').textContent = u.name;
  document.getElementById('pEmail').textContent = u.email;
  document.getElementById('pRole').textContent = u.role === 'admin' ? 'Administrator' : 'Customer';
  document.getElementById('pSince').textContent = formatDate(u.createdAt);
  document.getElementById('editName').value = u.name;
  document.getElementById('editEmail').value = u.email;
}
function showLinks() {
  const isAdmin = getUser().role === 'admin';
  document.getElementById('links').innerHTML = isAdmin
    ? '<a class="info-card" href="admin-products.html"><h3>Manage products</h3><p>Add, edit or delete products.</p></a>' +
      '<a class="info-card" href="admin-orders.html"><h3>All orders</h3><p>See the orders of all customers.</p></a>'
    : '<a class="info-card" href="cart.html"><h3>My cart</h3><p>Items you want to buy.</p></a>' +
      '<a class="info-card" href="orders.html"><h3>My orders</h3><p>Everything you ordered before.</p></a>';
}

document.getElementById('profileForm').addEventListener('submit', async function (event) {
  event.preventDefault();
  try {
    const data = await callServer('../Backend/users.php?action=update&id=' + getUser().id, 'PUT', {
      name: document.getElementById('editName').value,
      email: document.getElementById('editEmail').value,
      password: document.getElementById('newPassword').value
    });
    saveUser(data.user);
    document.getElementById('newPassword').value = '';
    showProfile();
    showMessage('profileMessage', 'Profile updated.', false);
  } catch (err) {
    showMessage('profileMessage', err.message, true);
  }
});

if (user) {
  showProfile();
  showLinks();
}
