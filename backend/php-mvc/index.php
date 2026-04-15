<?php
declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$currentUser = (isset($_SESSION['user']) && is_array($_SESSION['user'])) ? $_SESSION['user'] : null;
$currentRole = strtolower(trim((string) ($currentUser['role'] ?? '')));
$isStaffAccount = in_array($currentRole, ['admin', 'staff'], true);

$pageTitle = 'Trang chu';
require __DIR__ . '/includes/header.php';
?>

<section class="space-y-8">
    <div class="rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 p-8 text-white shadow-sm">
        <p class="text-sm uppercase tracking-wide text-teal-100">Restaurant Management</p>
        <h1 class="mt-2 text-3xl md:text-4xl font-bold">He thong dat ban va goi mon</h1>
        <p class="mt-3 max-w-2xl text-teal-50">
            Quan ly dat ban, theo doi gio hang va xu ly don nhanh gon tren mot ung dung PHP don gian.
        </p>

        <div class="mt-6 flex flex-wrap gap-3">
            <a href="menu.php" class="rounded-lg bg-white text-teal-700 px-4 py-2 font-semibold hover:bg-teal-50 transition-colors">
                Xem thuc don
            </a>
            <a href="reservation.php" class="rounded-lg border border-teal-200 text-white px-4 py-2 font-semibold hover:bg-white/10 transition-colors">
                Dat ban ngay
            </a>
            <?php if (!$currentUser): ?>
                <a href="login.php" class="rounded-lg border border-teal-200 text-white px-4 py-2 font-semibold hover:bg-white/10 transition-colors">
                    Dang nhap
                </a>
            <?php endif; ?>
            <?php if ($isStaffAccount): ?>
                <a href="admin_orders.php" class="rounded-lg border border-teal-200 text-white px-4 py-2 font-semibold hover:bg-white/10 transition-colors">
                    Vao trang Admin
                </a>
            <?php endif; ?>
        </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 class="font-semibold text-slate-900">1. Chon mon</h2>
            <p class="mt-2 text-sm text-slate-600">Tim kiem va loc mon an theo danh muc tren trang menu.</p>
        </article>

        <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 class="font-semibold text-slate-900">2. Quan ly gio hang</h2>
            <p class="mt-2 text-sm text-slate-600">Tang giam so luong mon va xem tong tien truoc khi dat ban.</p>
        </article>

        <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 class="font-semibold text-slate-900">3. Dat ban</h2>
            <p class="mt-2 text-sm text-slate-600">Nhap thong tin khach va tao reservation cung order tu gio hang.</p>
        </article>
    </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>
