# Woober - Simple E-Commerce Website

Woober is a small online shop built as a college project. Customers can browse products, add them to a cart and place orders. An admin can manage the products and the orders.

## Features

**Customer**
- Register and log in
- Browse and search products
- View product details
- Add products to a cart, change quantities, remove items
- Place an order and see the order history
- View and edit the profile

**Admin**
- Add, edit and delete products
- See the orders of all customers
- Mark orders as pending or completed

## Technologies

- Frontend: HTML, CSS, JavaScript
- Backend: PHP
- Database: MySQL

## How to run (with XAMPP)

1. Install XAMPP from https://www.apachefriends.org
2. Open the XAMPP Control Panel and click **Start** for both **Apache** and **MySQL**
3. Copy the `Woober` project folder into `C:\xampp\htdocs\`
4. Open http://localhost/Woober/ in the browser

The database called `woober`, its 4 tables, the admin account and 4 sample products are created automatically the first time you open the site. You do not need to import anything.

If your MySQL has a password, or a different user, change the 4 lines at the top of `Backend/database.php`.

## Without XAMPP

If PHP and MySQL are already installed, run this in the project folder:

```
php -S localhost:8000
```

Then open http://localhost:8000

## Admin login

- Email: `admin@woober.com`
- Password: `admin123`

## Project structure

```
Woober/
  index.php             opens the home page
  README.md             this file
  DOCUMENTATION.md      detailed explanation of every file and function
  Backend/
    database.php        connects to MySQL and creates the database, tables and sample data
    users.php           register, login, edit profile
    products.php        list, view, add, edit, delete products
    orders.php          place an order, list orders, change order status
  Frontend/
    *.html              the pages
    *.css               the design
    JS/                 the JavaScript of the pages
```

## Database tables

| Table | Stores |
|---|---|
| users | customers and the admin |
| products | the products of the shop |
| orders | one row per order |
| order_items | the products inside each order |

## Note

This project is made to be easy to understand. Passwords are stored as plain text and there are no security checks, so it should not be used as a real shop. See `DOCUMENTATION.md` for a full explanation of the code.
