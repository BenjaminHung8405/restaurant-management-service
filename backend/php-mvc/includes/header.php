<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$pageTitle = isset($pageTitle) ? $pageTitle : 'Restaurant Management';
$cartCount = (isset($_SESSION['cart']) && is_array($_SESSION['cart'])) ? count($_SESSION['cart']) : 0;
$currentUser = (isset($_SESSION['user']) && is_array($_SESSION['user'])) ? $_SESSION['user'] : null;
$currentRole = strtolower(trim((string) ($currentUser['role'] ?? '')));
$isStaffAccount = in_array($currentRole, ['admin', 'staff'], true);
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8'); ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen">
    <nav class="bg-white border-b border-slate-200">
        <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="index.php" class="font-bold text-lg text-teal-700">RestoMS</a>
            <div class="flex items-center gap-4 text-sm md:text-base">
                <a href="index.php" class="hover:text-teal-700 transition-colors">Trang chủ</a>
                <a href="menu.php" class="hover:text-teal-700 transition-colors">Thực đơn</a>
                <a href="reservation.php" class="hover:text-teal-700 transition-colors">Đặt bàn</a>
                <a href="cart.php" class="hover:text-teal-700 transition-colors">Giỏ hàng (<?php echo (int) $cartCount; ?>)</a>

                <?php if ($isStaffAccount): ?>
                    <a href="admin_orders.php" class="hover:text-teal-700 transition-colors">Admin Dashboard</a>
                    <a href="admin_menu.php" class="hover:text-teal-700 transition-colors">Admin Menu</a>
                <?php endif; ?>

                <?php if ($currentUser): ?>
                    <span class="hidden md:inline text-slate-600">
                        Xin chao, <?php echo htmlspecialchars((string) ($currentUser['username'] ?? ''), ENT_QUOTES, 'UTF-8'); ?>
                    </span>
                    <a href="logout.php" class="rounded-md bg-slate-700 text-white px-3 py-1.5 hover:bg-slate-800 transition-colors">Dang xuat</a>
                <?php else: ?>
                    <a href="login.php" class="rounded-md bg-teal-600 text-white px-3 py-1.5 hover:bg-teal-700 transition-colors">Dang nhap</a>
                <?php endif; ?>
            </div>
        </div>
    </nav>

    <main class="max-w-6xl mx-auto px-4 py-6">
