const user = requireLogin();

function showCart() {
  const cart = getCart();
  const list = document.getElementById('cartList');
  const summary = document.getElementById('summary');

  if (cart.length === 0) {
    list.innerHTML = '<p class="empty">Your cart is empty. <a href="products.html">Browse products</a>.</p>';
    summary.hidden = true;
    return;
  }

  let html = '';
  let total = 0;
  let count = 0;
  cart.forEach(function (item) {
    total += item.price * item.quantity;
    count += item.quantity;
    html += '<div class="manage-row">' +
      '<div class="thumb">' + imageHtml(item.imageUrl, item.name) + '</div>' +
      '<div class="info"><b>' + item.name + '</b><span>' + formatPrice(item.price) + ' each</span></div>' +
      '<div class="actions">' +
      '<input class="qty-input" type="number" min="1" max="' + item.stock + '" value="' + item.quantity + '" data-qty="' + item.id + '">' +
      '<button class="button button-small button-danger" type="button" data-remove="' + item.id + '">Remove</button>' +
      '</div></div>';
  });
  list.innerHTML = html;
  document.getElementById('total').textContent = formatPrice(total);
  document.getElementById('itemCount').textContent = count + ' items';
  summary.hidden = false;
}
document.getElementById('cartList').addEventListener('click', function (event) {
  const id = event.target.dataset.remove;
  if (id) {
    saveCart(getCart().filter(function (i) { return i.id !== Number(id); }));
    showCart();
  }
});
document.getElementById('cartList').addEventListener('change', function (event) {
  const id = event.target.dataset.qty;
  if (id) {
    const cart = getCart();
    const item = cart.find(function (i) { return i.id === Number(id); });
    item.quantity = Math.min(Math.max(1, Number(event.target.value)), item.stock);
    saveCart(cart);
    showCart();
  }
});
document.getElementById('orderBtn').addEventListener('click', async function () {
  const items = getCart().map(function (i) { return { productId: i.id, quantity: i.quantity }; });
  try {
    await callServer('../Backend/orders.php?action=place', 'POST', { userId: user.id, items: items });
    saveCart([]);
    location.href = 'orders.html?placed=1';
  } catch (err) {
    showMessage('pageMessage', err.message, true);
  }
});

if (user) {
  showCart();
}
