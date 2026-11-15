const user = requireLogin();

async function loadOrders() {
  const box = document.getElementById('orderList');
  const data = await callServer('../Backend/orders.php?action=all');
  document.getElementById('count').textContent = data.orders.length + ' orders';

  let html = '';
  data.orders.forEach(function (order) {
    const done = order.status === 'completed';
    html += '<section class="panel order-box">' +
      '<div class="panel-head"><h2>Order #' + order.id + '</h2><span class="chip' + (done ? ' chip-done' : '') + '">' + order.status + '</span></div>' +
      '<p class="order-date">' + order.customerName + ' (' + order.customerEmail + ') · ' + formatDate(order.createdAt) + '</p><ul class="order-lines">';
    order.items.forEach(function (i) {
      html += '<li><span>' + i.name + ' × ' + i.quantity + '</span><span>' + formatPrice(i.price * i.quantity) + '</span></li>';
    });
    html += '</ul><p class="order-total">Total: ' + formatPrice(order.total) + '</p>' +
      '<button class="button button-small" type="button" data-id="' + order.id + '" data-status="' + (done ? 'pending' : 'completed') + '">' +
      (done ? 'Mark as pending' : 'Mark as completed') + '</button></section>';
  });
  box.innerHTML = html || '<p class="empty">No orders yet.</p>';
}

document.getElementById('orderList').addEventListener('click', async function (event) {
  if (event.target.dataset.id) {
    await callServer('../Backend/orders.php?action=status&id=' + event.target.dataset.id, 'PUT', { status: event.target.dataset.status });
    loadOrders();
  }
});

if (user) {
  loadOrders();
}
