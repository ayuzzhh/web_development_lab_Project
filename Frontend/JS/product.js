async function loadProduct() {
  const box = document.getElementById('detail');
  const id = new URLSearchParams(location.search).get('id');
  const user = getUser();
  try {
    const data = await callServer('../Backend/products.php?action=get&id=' + id);
    const p = data.product;
    const inStock = p.stock > 0;
    document.title = p.name + ' — Woober';

    let html = '<div class="detail-image">' + imageHtml(p.imageUrl, p.name) + '</div>' +
      '<div class="detail-info"><h1>' + p.name + '</h1>' +
      '<p class="detail-price">' + formatPrice(p.price) + '</p>' +
      '<p>' + (inStock ? '<span class="chip">In stock</span> ' + p.stock + ' available' : '<span class="chip chip-out">Out of stock</span>') + '</p>' +
      '<p class="full-desc">' + (p.description || 'No description.') + '</p>';

    if (!user || user.role !== 'admin') {
      html += '<div class="buy-row"><input id="quantity" type="number" min="1" max="' + p.stock + '" value="1"' + (inStock ? '' : ' disabled') + '>' +
        '<button class="button" id="addBtn" type="button"' + (inStock ? '' : ' disabled') + '>Add to cart</button></div>';
    }
    box.innerHTML = html + '</div>';

    const addBtn = document.getElementById('addBtn');
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        const quantity = Math.max(1, Number(document.getElementById('quantity').value));
        addToCart(p, quantity);
        showMessage('pageMessage', 'Added to your cart.', false);
      });
    }
  } catch (err) {
    box.innerHTML = '<p class="empty">' + err.message + '</p>';
  }
}
loadProduct();
