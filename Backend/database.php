<?php
$host = '127.0.0.1';
$user = 'root';
$password = '';
$name = 'woober';

$db = new PDO("mysql:host=$host;charset=utf8mb4", $user, $password);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

$db->exec("CREATE DATABASE IF NOT EXISTS $name");
$db->exec("USE $name");

$db->exec("
  CREATE TABLE IF NOT EXISTS users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(150) NOT NULL UNIQUE,
    password   VARCHAR(100) NOT NULL,
    role       VARCHAR(20) NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
");
$db->exec("
  CREATE TABLE IF NOT EXISTS products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    price       DECIMAL(10,2) NOT NULL,
    stock       INT NOT NULL DEFAULT 0,
    image_url   VARCHAR(500) DEFAULT ''
  )
");
$db->exec("
  CREATE TABLE IF NOT EXISTS orders (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    total      DECIMAL(10,2) NOT NULL,
    status     VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
");
$db->exec("
  CREATE TABLE IF NOT EXISTS order_items (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    order_id     INT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    price        DECIMAL(10,2) NOT NULL,
    quantity     INT NOT NULL
  )
");

if (!$db->query("SELECT id FROM users WHERE role = 'admin'")->fetch()) {
    $db->exec("INSERT INTO users (name, email, password, role) VALUES ('Admin', 'admin@woober.com', 'admin123', 'admin')");
}

if ($db->query("SELECT COUNT(*) AS n FROM products")->fetch()['n'] == 0) {
    $add = $db->prepare("INSERT INTO products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)");
    $add->execute(['Notebook', 'A ruled notebook with 200 pages.', 120, 50, 'https://picsum.photos/seed/notebook/400/300']);
    $add->execute(['Water Bottle', 'Steel bottle, keeps water cold.', 350, 30, 'https://picsum.photos/seed/bottle/400/300']);
    $add->execute(['Backpack', 'Strong bag for college and travel.', 899, 15, 'https://picsum.photos/seed/backpack/400/300']);
    $add->execute(['Headphones', 'Wired headphones with a mic.', 499, 20, 'https://picsum.photos/seed/headphones/400/300']);
}

function reply($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function fail($message, $code = 400) {
    reply(['error' => $message], $code);
}

function body() {
    $data = json_decode(file_get_contents('php://input'), true);
    return $data ? $data : [];
}
