<?php
declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require __DIR__ . '/db.php';

if (!isset($_SESSION['cart']) || !is_array($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

$action = isset($_GET['action']) ? trim((string) $_GET['action']) : '';
$itemId = isset($_GET['id']) ? trim((string) $_GET['id']) : '';

$redirectTo = isset($_SERVER['HTTP_REFERER']) && $_SERVER['HTTP_REFERER'] !== ''
    ? (string) $_SERVER['HTTP_REFERER']
    : 'menu.php';

$itemExists = static function (PDO $pdo, string $id): bool {
    $stmt = $pdo->prepare('SELECT 1 FROM menu_items WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $id]);

    return (bool) $stmt->fetchColumn();
};

switch ($action) {
    case 'add':
        if ($itemId !== '' && $itemExists($pdo, $itemId)) {
            if (isset($_SESSION['cart'][$itemId])) {
                $_SESSION['cart'][$itemId] = (int) $_SESSION['cart'][$itemId] + 1;
            } else {
                $_SESSION['cart'][$itemId] = 1;
            }
        }
        break;

    case 'remove':
        if ($itemId !== '' && isset($_SESSION['cart'][$itemId])) {
            unset($_SESSION['cart'][$itemId]);
        }
        break;

    case 'update':
        if ($itemId !== '' && isset($_SESSION['cart'][$itemId])) {
            $quantity = isset($_GET['quantity']) ? (int) $_GET['quantity'] : 1;

            if ($quantity <= 0) {
                unset($_SESSION['cart'][$itemId]);
            } else {
                $_SESSION['cart'][$itemId] = $quantity;
            }
        }
        break;

    default:
        break;
}

if (empty($_SESSION['cart'])) {
    unset($_SESSION['cart']);
}

header('Location: ' . $redirectTo);
exit;
