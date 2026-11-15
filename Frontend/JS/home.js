async function loadHome() {
  const box = document.getElementById('featured');
  const user = getUser();
  try {
    const data = await callServer('../Backend/products.php?action=list');
    const products = data.products.slice(0, 4);
    let html = '';
    products.forEach(function (p) { html += productCardHtml(p, user && user.role === 'admin'); });
    box.innerHTML = html || '<p class="empty">No products yet.</p>';
    watchAddButtons(box, products, 'pageMessage');
  } catch (err) {
    box.innerHTML = '<p class="empty">' + err.message + '</p>';
  }
}
loadHome();
