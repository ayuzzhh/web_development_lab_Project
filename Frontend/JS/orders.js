const user = requireLogin();

async function loadOrders() {
  const box = document.getElementById('orderList');
  if (location.search.includes('placed=1')) {
    showMessage('pageMessage', 'Thank you! Your order has been placed.', false);
  }
  try {
    const data = await callServer('../Backend/orders.php?action=mine&userId=' + user.id);
    if (data.orders.length === 0) {
      box.innerHTML = '<p class="empty">You have no orders yet. <a href="products.html">Start shopping</a>.</p>';
      return;
    }
    let html = '';
    data.orders.forEach(function (order) {
      html += '<section class="panel order-box">' +
        '<div class="panel-head"><h2>Order #' + order.id + '</h2><span class="chip">' + order.status + '</span></div>' +
        '<p class="order-date">Placed on ' + formatDate(order.createdAt) + '</p><ul class="order-lines">';
      order.items.forEach(function (i) {
        html += '<li><span>' + i.name + ' × ' + i.quantity + '</span><span>' + formatPrice(i.price * i.quantity) + '</span></li>';
      });
      html += '</ul><p class="order-total">Total: ' + formatPrice(order.total) + '</p></section>';
    });
    box.innerHTML = html;
  } catch (err) {
    box.innerHTML = '<p class="empty">' + err.message + '</p>';
  }
}
if (user) {
  loadOrders();
}
