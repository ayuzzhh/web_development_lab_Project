const user = requireLogin();
const form = document.getElementById('productForm');
let products = [];
let editingId = null;
function showList() {
  document.getElementById('count').textContent = products.length + ' products';
  let html = '';
  products.forEach(function (p) {
    html += '<div class="manage-row">' +
      '<div class="thumb">' + imageHtml(p.imageUrl, p.name) + '</div>' +
      '<div class="info"><b>' + p.name + '</b><span>' + formatPrice(p.price) + ' · Stock: ' + p.stock + '</span></div>' +
      '<div class="actions">' +
      '<button class="button button-small button-outline" type="button" data-edit="' + p.id + '">Edit</button>' +
      '<button class="button button-small button-danger" type="button" data-delete="' + p.id + '">Delete</button>' +
      '</div></div>';
  });
  document.getElementById('list').innerHTML = html || '<p class="empty">No products yet.</p>';
}

async function loadProducts() {
  const data = await callServer('../Backend/products.php?action=list');
  products = data.products;
  showList();
}
function resetForm() {
  editingId = null;
  form.reset();
  document.getElementById('formKicker').textContent = 'ADD NEW PRODUCT';
  document.getElementById('submitBtn').textContent = 'Add product';
  document.getElementById('cancelBtn').hidden = true;
}
document.getElementById('list').addEventListener('click', async function (event) {
  const editId = event.target.dataset.edit;
  const deleteId = event.target.dataset.delete;

  if (editId) {
    const p = products.find(function (x) { return x.id === Number(editId); });
    editingId = p.id;
    document.getElementById('name').value = p.name;
    document.getElementById('price').value = p.price;
    document.getElementById('stock').value = p.stock;
    document.getElementById('imageUrl').value = p.imageUrl;
    document.getElementById('description').value = p.description;
    document.getElementById('formKicker').textContent = 'EDIT PRODUCT';
    document.getElementById('submitBtn').textContent = 'Save changes';
    document.getElementById('cancelBtn').hidden = false;
    form.scrollIntoView();
  }

  if (deleteId && confirm('Delete this product?')) {
    await callServer('../Backend/products.php?action=delete&id=' + deleteId, 'DELETE');
    resetForm();
    loadProducts();
  }
});
form.addEventListener('submit', async function (event) {
  event.preventDefault();
  const product = {
    name: document.getElementById('name').value,
    price: document.getElementById('price').value,
    stock: document.getElementById('stock').value,
    imageUrl: document.getElementById('imageUrl').value,
    description: document.getElementById('description').value
  };
  try {
    if (editingId) {
      await callServer('../Backend/products.php?action=update&id=' + editingId, 'PUT', product);
      showMessage('formMessage', 'Changes saved.', false);
    } else {
      await callServer('../Backend/products.php?action=add', 'POST', product);
      showMessage('formMessage', 'Product added.', false);
    }
    resetForm();
    loadProducts();
  } catch (err) {
    showMessage('formMessage', err.message, true);
  }
});

document.getElementById('cancelBtn').addEventListener('click', resetForm);

if (user) {
  loadProducts();
}
