<?php
require 'database.php';

$action = $_GET['action'] ?? '';
$data = body();

function toUser($row) {
    return [
        'id' => (int)$row['id'],
        'name' => $row['name'],
        'email' => $row['email'],
        'role' => $row['role'],
        'createdAt' => $row['created_at']
    ];
}

if ($action == 'register') {
    $name = $data['name'] ?? '';
    $email = strtolower($data['email'] ?? '');
    $password = $data['password'] ?? '';
    if ($name == '' || $email == '' || $password == '') {
        fail('Please fill in all the fields.');
    }
    $check = $db->prepare("SELECT id FROM users WHERE email = ?");
    $check->execute([$email]);
    if ($check->fetch()) {
        fail('This email is already registered.');
    }
    $db->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)")->execute([$name, $email, $password]);
    $get = $db->prepare("SELECT * FROM users WHERE id = ?");
    $get->execute([$db->lastInsertId()]);
    reply(['user' => toUser($get->fetch())]);
}

if ($action == 'login') {
    $get = $db->prepare("SELECT * FROM users WHERE email = ? AND password = ?");
    $get->execute([strtolower($data['email'] ?? ''), $data['password'] ?? '']);
    $user = $get->fetch();
    if (!$user) {
        fail('Wrong email or password.');
    }
    reply(['user' => toUser($user)]);
}

if ($action == 'update') {
    $id = $_GET['id'] ?? 0;
    $get = $db->prepare("SELECT * FROM users WHERE id = ?");
    $get->execute([$id]);
    $user = $get->fetch();
    if (!$user) {
        fail('User not found.', 404);
    }
    $email = strtolower($data['email'] ?? '');
    $check = $db->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
    $check->execute([$email, $id]);
    if ($check->fetch()) {
        fail('This email is used by someone else.');
    }
    $password = ($data['password'] ?? '') != '' ? $data['password'] : $user['password'];
    $db->prepare("UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?")
       ->execute([$data['name'] ?? '', $email, $password, $id]);
    $get->execute([$id]);
    reply(['user' => toUser($get->fetch())]);
}

fail('Unknown action.', 404);
