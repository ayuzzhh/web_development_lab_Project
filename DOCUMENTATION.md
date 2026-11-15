# Woober - Code Explanation

Woober is a small online shop. Customers can register, log in, look at products, add them to a cart and place orders. One admin can add, edit and delete products and see all orders.

Technologies: HTML, CSS, JavaScript (website) + PHP (server) + MySQL (database).

---

## 1. How to run

1. Install XAMPP. Start **Apache** and **MySQL** in the XAMPP Control Panel.
2. Copy the `webD_Project` folder into `C:\xampp\htdocs\`.
3. Open http://localhost/webD_Project/ in the browser.

Admin login: `admin@woober.com` / `admin123`. The database, the tables, the admin account and 4 sample products are created automatically the first time a page asks the server for data.

To reset everything, open phpMyAdmin (http://localhost/phpmyadmin), delete the database `woober` and open the site again.

---

## 2. How the project works

```
Browser (Frontend)  <---- requests / answers (JSON) ---->  PHP files (Backend)  <---->  MySQL database
```

1. The user opens a page (for example `products.html`).
2. The JavaScript of that page asks a PHP file for data, for example `Backend/products.php?action=list`.
3. The PHP file reads the database and sends the data back as JSON.
4. The JavaScript puts the data into the page.

Two things are saved in the browser itself (localStorage), not in the database:
- `user` - who is logged in.
- `cart` - the items in the cart. Only when the user clicks "Place order" the cart is sent to the server.

Nothing is protected or encrypted on purpose, to keep the project easy to understand. Passwords are stored as plain text and the pages trust the browser. A real shop would need more.

---

## 3. Folder structure

```
Woober/
  index.php                 opens Frontend/index.html
  README.md                 how to run the project
  DOCUMENTATION.md          this file
  Backend/
    database.php            connects to MySQL, creates tables, helper functions
    users.php               register, login, edit profile
    products.php            list, view, add, edit, delete products
    orders.php              place order, list orders, change status
  Frontend/
    *.html                  the pages
    *.css                   the design
    JS/                     the JavaScript of the pages
```

---

## 4. Database (4 tables)

| Table | What it stores | Columns |
|---|---|---|
| users | every customer and the admin | id, name, email, password, role, created_at |
| products | the products of the shop | id, name, description, price, stock, image_url |
| orders | one row per order | id, user_id, total, status, created_at |
| order_items | the products inside an order | id, order_id, product_name, price, quantity |

- `role` is `customer` or `admin`.
- `status` is `pending` or `completed`.
- `order_items` keeps its own copy of the product name and price, so an old order stays correct even if the product is changed or deleted later.

---

## 5. Backend files (PHP)

### Backend/database.php
Every other PHP file starts with `require 'database.php';`, so this file runs first.
- The first 4 lines hold the MySQL settings: host, user, password and database name. XAMPP uses user `root` with an empty password. Change them here if yours are different.
- `new PDO(...)` connects to MySQL. PDO is PHP's way of talking to a database.
- `CREATE DATABASE IF NOT EXISTS` and `CREATE TABLE IF NOT EXISTS` create the database and the 4 tables only when they do not exist yet.
- If there is no admin yet, it inserts the admin account. If there are no products yet, it inserts 4 sample products.
- Three small helper functions are at the end:
  - `reply($data)` sends the data back to the browser as JSON and stops.
  - `fail($message)` sends an error message (status 400) and stops. The website shows this message.
  - `body()` reads the JSON that the browser sent.

### Backend/users.php
The address ends with `?action=...` and the file runs the part for that action.

| Address | What it does |
|---|---|
| users.php?action=register | Checks that all fields are filled and the email is new, saves a new customer and sends the user back. |
| users.php?action=login | Looks for a user with this email and password. Wrong = error message. |
| users.php?action=update&id=3 | Saves the new name, email and (if typed) password of user 3. |

`toUser` changes a database row into the object the website uses. It leaves out the password.

### Backend/products.php

| Address | What it does |
|---|---|
| products.php?action=list | Sends all products, newest first. |
| products.php?action=get&id=3 | Sends product 3. |
| products.php?action=add | Adds a product (used by the admin page). |
| products.php?action=update&id=3 | Changes product 3. |
| products.php?action=delete&id=3 | Deletes product 3. |

`toProduct` changes a database row into the object the website uses (for example `image_url` becomes `imageUrl`, and numbers become real numbers).

### Backend/orders.php

| Address | What it does |
|---|---|
| orders.php?action=place | Places an order (see below). |
| orders.php?action=mine&userId=3 | Sends the orders of customer 3. |
| orders.php?action=all | Sends the orders of all customers (admin page). |
| orders.php?action=status&id=5 | Changes the status of order 5 (admin page). |

`loadOrders` takes order rows and adds the list of products of each order.

How placing an order works (`action=place`):
1. The browser sends the user id and the cart items (product id + quantity).
2. For every item the server reads the product from the database, checks that enough stock is left, and adds `price x quantity` to the total. The price always comes from the database.
3. It saves one row in `orders`, one row per product in `order_items`, and reduces the stock of each product.

In the PHP code the values are put into the query with `?` and `execute([...])`. This is simply how PDO is used.

---

## 6. Frontend pages (HTML)

| File | Page |
|---|---|
| index.html | Home page: welcome text and the 4 newest products |
| products.html | All products with a search box |
| product.html | Details of one product (`product.html?id=3`) |
| cart.html | Shopping cart and the "Place order" button |
| orders.html | Order history of the logged-in customer |
| login.html | Login form |
| register.html | Create-account form |
| dashboard.html | Profile of the user, edit profile, quick links |
| admin-products.html | Admin: add, edit, delete products |
| admin-orders.html | Admin: all orders, mark completed |
| about.html, contact.html | Plain information pages |

Every page has a header with an empty `<div class="header-actions">`. The JavaScript fills it with Log in / Sign up or Log out, and adds the menu links that fit the user (customer or admin).

## 7. Frontend CSS files

| File | Used for |
|---|---|
| common.css | Colors, header, footer, buttons, forms - used by every page |
| user.css | Product boxes, cart, orders, admin pages, account page |
| index.css | Home page hero part |
| about.css | About page |
| contact.css | Contact page |
| login.css | Login page |
| store.css | Register page form |

## 8. Frontend JavaScript files (Frontend/JS)

### api.js - shared by every page
Loaded first on every page. Its functions are used by all other JS files.

| Function | What it does |
|---|---|
| callServer(url, method, body) | Sends a request to a PHP file with `fetch` and returns the answer. If the server answers with an error, it throws it so the page can show the message. |
| getUser / saveUser / logout | Read, save and delete the logged-in user in localStorage. Logout also empties the cart. |
| requireLogin | If nobody is logged in, goes to the login page. Used by pages that need a user. |
| getCart / saveCart | Read and save the cart list in localStorage. |
| addToCart(product, quantity) | Adds a product to the cart (or increases its quantity, never above the stock). Goes to the login page if nobody is logged in. |
| showCartCount | Writes "Cart (3)" in the menu. |
| buildHeader | Adds the menu links and the Log in / Log out buttons. |
| formatPrice, formatDate | Show a price like ₹1,200 and a date like 12/11/2026. |
| showMessage(id, text, isError) | Writes a message in a page element (red when it is an error). |
| imageHtml | Makes the `<img>` of a product, or a grey "No image" box. |
| productCardHtml | Makes the HTML box of one product. Used by home and products pages. |
| watchAddButtons | Makes the "Add to cart" buttons of a product list work. |

The last part of the file runs on every page: it builds the header, writes the year in the footer and makes the phone menu button work.

### script.js - login.html and register.html
- Login form: sends email and password to `users.php?action=login`, saves the returned user, then opens the admin page (admin) or the account page (customer). Wrong details show an error.
- Register form: checks that both passwords are the same, sends the data to `users.php?action=register`, saves the user and opens the account page.

### home.js
Gets all products, shows the first 4 and makes their "Add to cart" buttons work.

### products.js
Gets all products and shows them. `showProducts` filters the list by what is typed in the search box and runs again on every key press.

### product.js
Reads the `id` from the address, gets that product and shows its image, price, stock and description with a quantity box and an "Add to cart" button (not shown to the admin).

### cart.js
- `showCart` reads the cart from localStorage, shows each item with a quantity box and a Remove button, and calculates the total and the item count.
- Remove button deletes the item from the cart. Changing the quantity box updates the cart.
- "Place order" sends the user id and the items to `orders.php?action=place`, empties the cart and opens `orders.html?placed=1`. If the server refuses (for example not enough stock) the message is shown.

### orders.js
Gets the customer's orders from `orders.php?action=mine` and shows every order with its status, date, products and total. Shows a thank-you message when the address has `placed=1`.

### dashboard.js
- `showProfile` writes the name, email, type and join date of the user in the page and in the edit form.
- `showLinks` shows two link boxes: admin gets "Manage products / All orders", customer gets "My cart / My orders".
- The edit form sends the new details to `users.php?action=update`, saves the returned user and refreshes the page. The password is changed only if something is typed.

### admin-products.js
- `loadProducts` + `showList` show all products, each with Edit and Delete buttons.
- The form is used for both adding and editing. The variable `editingId` remembers which: empty = add, a number = edit.
- Edit button fills the form with the product. Delete button asks for confirmation, then deletes.
- The product picture is a web link typed in the "Image link" box.

### admin-orders.js
Gets all orders from `orders.php?action=all` and shows every order with the customer name and email. The button on each order switches its status between pending and completed.

---

## 9. What was kept out to keep it simple
- Password hashing: passwords are plain text.
- Sessions and cookies.
- Admin checks on the server, ownership checks on orders.
- Escaping of text and strict input checking.
- Image upload (the admin pastes an image link instead).
- Server-side cart, database transactions, automated tests.
