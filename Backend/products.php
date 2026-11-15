<?php
require 'database.php';

$action = $_GET['action'] ?? '';
$data = body();

function toProduct($row) {
    return [
        'id' => (int)$row['id'],
        'name' => $row['name'],
        'description' => $row['description'],
        'price' => (float)$row['price'],
        'stock' => (int)$row['stock'],
        'imageUrl' => $row['image_url']
    ];
}

if ($action == 'list') {
    $rows = $db->query("SELECT * FROM products ORDER BY id DESC")->fetchAll();
    reply(['products' => array_map('toProduct', $rows)]);
}

if ($action == 'get') {
    $get = $db->prepare("SELECT * FROM products WHERE id = ?");
    $get->execute([$_GET['id'] ?? 0]);
    $row = $get->fetch();
    if (!$row) {
        fail('Product not found.', 404);
    }
    reply(['product' => toProduct($row)]);
}

if ($action == 'add') {
    if (($data['name'] ?? '') == '' || ($data['price'] ?? '') === '') {
        fail('Name and price are required.');
    }
    $db->prepare("INSERT INTO products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)")
       ->execute([$data['name'], $data['description'] ?? '', (float)$data['price'], (int)($data['stock'] ?? 0), $data['imageUrl'] ?? '']);
    reply(['message' => 'Product added.']);
}

if ($action == 'update') {
    $db->prepare("UPDATE products SET name = ?, description = ?, price = ?, stock = ?, image_url = ? WHERE id = ?")
       ->execute([$data['name'] ?? '', $data['description'] ?? '', (float)($data['price'] ?? 0), (int)($data['stock'] ?? 0), $data['imageUrl'] ?? '', $_GET['id'] ?? 0]);
    reply(['message' => 'Product updated.']);
}

if ($action == 'delete') {
    $db->prepare("DELETE FROM products WHERE id = ?")->execute([$_GET['id'] ?? 0]);
    reply(['message' => 'Product deleted.']);
}

fail('Unknown action.', 404);
