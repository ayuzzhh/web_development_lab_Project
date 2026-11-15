async function callServer(url, method, body) {
  const options = { method: method || 'GET', headers: { 'Content-Type': 'application/json' } };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong.');
  }
  return data;
}
function getUser() {
  const text = localStorage.getItem('user');
  return text ? JSON.parse(text) : null;
}
function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}
function logout() {
  localStorage.removeItem('user');
  localStorage.removeItem('cart');
  location.href = 'login.html';
}
function requireLogin() {
  const user = getUser();
  if (!user) {
    location.href = 'login.html';
  }
  return user;
}
function getCart() {
  const text = localStorage.getItem('cart');
  return text ? JSON.parse(text) : [];
}
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  showCartCount();
}
function addToCart(product, quantity) {
  if (!getUser()) {
    location.href = 'login.html';
    return;
  }
  const cart = getCart();
  let item = cart.find(function (i) { return i.id === product.id; });
  if (item) {
    item.quantity = Math.min(item.quantity + quantity, product.stock);
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, stock: product.stock, quantity: quantity });
  }
  saveCart(cart);
}
function showCartCount() {
  const link = document.getElementById('cartLink');
  if (link) {
    let count = 0;
    getCart().forEach(function (i) { count += i.quantity; });
    link.textContent = count > 0 ? 'Cart (' + count + ')' : 'Cart';
  }
}
function buildHeader() {
  const nav = document.querySelector('.main-nav');
  const actions = document.querySelector('.header-actions');
  if (!nav || !actions) {
    return;
  }
  const user = getUser();
  let links = [];
  if (user && user.role === 'admin') {
    links = [['admin-products.html', 'Manage products'], ['admin-orders.html', 'All orders'], ['dashboard.html', 'Account']];
  } else if (user) {
    links = [['cart.html', 'Cart'], ['orders.html', 'My orders'], ['dashboard.html', 'Account']];
  }
  links.forEach(function (link) {
    const a = document.createElement('a');
    a.href = link[0];
    a.textContent = link[1];
    if (link[1] === 'Cart') {
      a.id = 'cartLink';
    }
    if (location.pathname.endsWith('/' + link[0])) {
      a.className = 'active';
    }
    nav.appendChild(a);
  });

  if (user) {
    actions.innerHTML = '<button class="button button-dark button-small" id="logoutBtn" type="button">Log out</button>';
    document.getElementById('logoutBtn').addEventListener('click', logout);
  } else {
    actions.innerHTML = '<a class="login-link" href="login.html">Log in</a>' +
      '<a class="button button-dark button-small" href="register.html">Sign up</a>';
  }
  showCartCount();
}
function formatPrice(price) {
  return '₹' + Number(price).toLocaleString('en-IN');
}
function formatDate(text) {
  return new Date(text.replace(' ', 'T') + 'Z').toLocaleDateString('en-IN');
}
function showMessage(id, text, isError) {
  const box = document.getElementById(id);
  box.textContent = text;
  box.className = isError ? 'form-message error' : 'form-message';
}
function imageHtml(url, name) {
  return url ? '<img src="' + url + '" alt="' + name + '">' : '<div class="no-image">No image</div>';
}
function productCardHtml(product, isAdmin) {
  const inStock = product.stock > 0;
  let html = '<article class="item-card">' +
    '<a class="media" href="product.html?id=' + product.id + '">' + imageHtml(product.imageUrl, product.name) + '</a>' +
    '<div class="item-body">' +
    '<h3><a href="product.html?id=' + product.id + '">' + product.name + '</a></h3>' +
    '<div class="item-meta"><span class="price">' + formatPrice(product.price) + '</span>' +
    (inStock ? '<span class="chip">In stock</span>' : '<span class="chip chip-out">Out of stock</span>') + '</div>' +
    '<p class="short-desc">' + product.description + '</p>' +
    '<div class="card-actions"><a class="button button-small button-outline" href="product.html?id=' + product.id + '">Details</a>';
  if (!isAdmin) {
    html += '<button class="button button-small" type="button" data-add="' + product.id + '"' + (inStock ? '' : ' disabled') + '>Add to cart</button>';
  }
  return html + '</div></div></article>';
}
function watchAddButtons(box, products, messageId) {
  box.addEventListener('click', function (event) {
    const button = event.target.closest('[data-add]');
    if (!button) {
      return;
    }
    const product = products.find(function (p) { return p.id === Number(button.dataset.add); });
    addToCart(product, 1);
    showMessage(messageId, '"' + product.name + '" added to your cart.', false);
  });
}
document.addEventListener('DOMContentLoaded', function () {
  buildHeader();
  document.querySelectorAll('.year').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () { nav.classList.toggle('is-open'); });
  }
});
