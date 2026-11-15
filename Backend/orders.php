<?php
require 'database.php';

$action = $_GET['action'] ?? '';
$data = body();

function loadOrders($db, $rows) {
    $orders = [];
    foreach ($rows as $row) {
        $get = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
        $get->execute([$row['id']]);
        $items = [];
        foreach ($get->fetchAll() as $i) {
            $items[] = ['name' => $i['product_name'], 'price' => (float)$i['price'], 'quantity' => (int)$i['quantity']];
        }
        $orders[] = [
            'id' => (int)$row['id'],
            'total' => (float)$row['total'],
            'status' => $row['status'],
            'createdAt' => $row['created_at'],
            'customerName' => $row['name'],
            'customerEmail' => $row['email'],
            'items' => $items
        ];
    }
    return $orders;
}

if ($action == 'place') {
    $userId = $data['userId'] ?? 0;
    $items = $data['items'] ?? [];
    if (!$userId || count($items) == 0) {
        fail('Your cart is empty.');
    }

    $total = 0;
    $lines = [];
    foreach ($items as $item) {
        $get = $db->prepare("SELECT * FROM products WHERE id = ?");
        $get->execute([$item['productId']]);
        $product = $get->fetch();
        if (!$product) {
            fail('A product in your cart no longer exists.');
        }
        if ($item['quantity'] > $product['stock']) {
            fail($product['name'] . ': only ' . $product['stock'] . ' in stock.');
        }
        $total += $product['price'] * $item['quantity'];
        $lines[] = ['product' => $product, 'quantity' => (int)$item['quantity']];
    }

    $db->prepare("INSERT INTO orders (user_id, total) VALUES (?, ?)")->execute([$userId, $total]);
    $orderId = $db->lastInsertId();
    foreach ($lines as $line) {
        $db->prepare("INSERT INTO order_items (order_id, product_name, price, quantity) VALUES (?, ?, ?, ?)")
           ->execute([$orderId, $line['product']['name'], $line['product']['price'], $line['quantity']]);
        $db->prepare("UPDATE products SET stock = stock - ? WHERE id = ?")
           ->execute([$line['quantity'], $line['product']['id']]);
    }
    reply(['message' => 'Order placed.', 'orderId' => (int)$orderId]);
}

if ($action == 'mine') {
    $get = $db->prepare("SELECT o.*, u.name, u.email FROM orders o JOIN users u ON u.id = o.user_id WHERE o.user_id = ? ORDER BY o.id DESC");
    $get->execute([$_GET['userId'] ?? 0]);
    reply(['orders' => loadOrders($db, $get->fetchAll())]);
}

if ($action == 'all') {
    $rows = $db->query("SELECT o.*, u.name, u.email FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.id DESC")->fetchAll();
    reply(['orders' => loadOrders($db, $rows)]);
}

if ($action == 'status') {
    $db->prepare("UPDATE orders SET status = ? WHERE id = ?")->execute([$data['status'] ?? 'pending', $_GET['id'] ?? 0]);
    reply(['message' => 'Status updated.']);
}

fail('Unknown action.', 404);
