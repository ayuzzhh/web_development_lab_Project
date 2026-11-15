const grid = document.getElementById('grid');
const search = document.getElementById('search');
const user = getUser();
let products = [];
function showProducts() {
  const text = search.value.toLowerCase();
  const shown = products.filter(function (p) {
    return (p.name + ' ' + p.description).toLowerCase().includes(text);
  });
  document.getElementById('count').textContent = shown.length + ' products';

  let html = '';
  shown.forEach(function (p) { html += productCardHtml(p, user && user.role === 'admin'); });
  grid.innerHTML = html || '<p class="empty">No products found.</p>';
}

async function loadProducts() {
  try {
    const data = await callServer('../Backend/products.php?action=list');
    products = data.products;
    showProducts();
    watchAddButtons(grid, products, 'pageMessage');
  } catch (err) {
    grid.innerHTML = '<p class="empty">' + err.message + '</p>';
  }
}

search.addEventListener('input', showProducts);
loadProducts();
