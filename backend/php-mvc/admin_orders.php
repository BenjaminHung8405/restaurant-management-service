<?php
declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require __DIR__ . '/db.php';

$currentUser = isset($_SESSION['user']) && is_array($_SESSION['user']) ? $_SESSION['user'] : null;
$currentRole = strtolower(trim((string) ($currentUser['role'] ?? '')));

if (!$currentUser || !in_array($currentRole, ['admin', 'staff'], true)) {
    $_SESSION['auth_error'] = 'Ban khong co quyen truy cap trang quan tri.';
    header('Location: login.php?error=' . urlencode('Ban khong co quyen truy cap trang quan tri.'));
    exit;
}

$flashSuccess = '';
$flashError = '';

if (isset($_SESSION['admin_orders_success'])) {
    $flashSuccess = (string) $_SESSION['admin_orders_success'];
    unset($_SESSION['admin_orders_success']);
}

if (isset($_SESSION['admin_orders_error'])) {
    $flashError = (string) $_SESSION['admin_orders_error'];
    unset($_SESSION['admin_orders_error']);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && (string) ($_POST['action'] ?? '') === 'update_status') {
    $reservationId = trim((string) ($_POST['reservation_id'] ?? ''));
    $newStatus = strtolower(trim((string) ($_POST['status'] ?? '')));
    $allowedStatuses = ['confirmed', 'cancelled', 'completed'];

    if ($reservationId === '' || !in_array($newStatus, $allowedStatuses, true)) {
        $_SESSION['admin_orders_error'] = 'Yeu cau cap nhat trang thai khong hop le.';
        header('Location: admin_orders.php');
        exit;
    }

    try {
        $updateSql = '
            UPDATE reservations
            SET status = :status,
                updated_at = NOW()
            WHERE id = :reservation_id
        ';

        $updateStmt = $pdo->prepare($updateSql);
        $updateStmt->execute([
            'status' => $newStatus,
            'reservation_id' => $reservationId,
        ]);

        if ($updateStmt->rowCount() > 0) {
            $_SESSION['admin_orders_success'] = 'Cap nhat trang thai dat ban thanh cong.';
        } else {
            $_SESSION['admin_orders_error'] = 'Khong tim thay reservation de cap nhat.';
        }
    } catch (PDOException $exception) {
        error_log('admin_orders.php update error: ' . $exception->getMessage());
        $_SESSION['admin_orders_error'] = 'Cap nhat trang thai that bai. Vui long thu lai.';
    }

    header('Location: admin_orders.php');
    exit;
}

$totalReservations = 0;
$pendingToday = 0;
$completedReservations = 0;
$reservations = [];

try {
    $totalReservations = (int) $pdo->query('SELECT COUNT(*) FROM reservations')->fetchColumn();

    $pendingTodayStmt = $pdo->prepare('
        SELECT COUNT(*)
        FROM reservations
        WHERE status = :status
          AND DATE(reservation_time) = CURDATE()
    ');
    $pendingTodayStmt->execute(['status' => 'pending']);
    $pendingToday = (int) $pendingTodayStmt->fetchColumn();

    $completedStmt = $pdo->prepare('
        SELECT COUNT(*)
        FROM reservations
        WHERE status = :status
    ');
    $completedStmt->execute(['status' => 'completed']);
    $completedReservations = (int) $completedStmt->fetchColumn();

    $reservationsSql = '
        SELECT
            r.id,
            r.guest_name,
            r.guest_phone,
            r.reservation_time,
            r.guest_count,
            r.status,
            r.created_at,
            t.table_number,
            o.id AS order_id,
            o.total_amount AS order_total,
            o.order_status,
            o.payment_status
        FROM reservations r
        LEFT JOIN tables t
            ON t.id = r.table_id
        LEFT JOIN (
            SELECT o1.id, o1.table_id, o1.total_amount, o1.order_status, o1.payment_status, o1.created_at
            FROM orders o1
            INNER JOIN (
                SELECT table_id, MAX(created_at) AS latest_created_at
                FROM orders
                GROUP BY table_id
            ) latest
                ON latest.table_id = o1.table_id
               AND latest.latest_created_at = o1.created_at
        ) o
            ON o.table_id = r.table_id
        ORDER BY r.created_at DESC
    ';

    $reservationsStmt = $pdo->query($reservationsSql);
    $reservations = $reservationsStmt->fetchAll();
} catch (PDOException $exception) {
    error_log('admin_orders.php fetch error: ' . $exception->getMessage());
    $flashError = 'Khong the tai du lieu dashboard. Vui long thu lai.';
}

$statusBadge = static function (string $status): array {
    $normalized = strtolower(trim($status));

    switch ($normalized) {
        case 'confirmed':
            return ['Confirmed', 'bg-emerald-100 text-emerald-700 border-emerald-200'];
        case 'completed':
            return ['Completed', 'bg-blue-100 text-blue-700 border-blue-200'];
        case 'cancelled':
            return ['Cancelled', 'bg-red-100 text-red-700 border-red-200'];
        default:
            return ['Pending', 'bg-amber-100 text-amber-700 border-amber-200'];
    }
};

$pageTitle = 'Admin Orders Dashboard';
require __DIR__ . '/includes/header.php';
?>

<section class="w-full space-y-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
            <h1 class="text-2xl md:text-3xl font-bold text-slate-900">Admin Reservations Dashboard</h1>
            <p class="text-slate-600 mt-1">Quan ly dat ban va cap nhat trang thai don cho nhan vien.</p>
        </div>
        <div class="text-sm text-slate-500">
            Dang nhap boi: <span class="font-medium text-slate-700"><?php echo htmlspecialchars((string) ($currentUser['username'] ?? ''), ENT_QUOTES, 'UTF-8'); ?></span>
        </div>
    </div>

    <?php if ($flashSuccess !== ''): ?>
        <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-700">
            <?php echo htmlspecialchars($flashSuccess, ENT_QUOTES, 'UTF-8'); ?>
        </div>
    <?php endif; ?>

    <?php if ($flashError !== ''): ?>
        <div class="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
            <?php echo htmlspecialchars($flashError, ENT_QUOTES, 'UTF-8'); ?>
        </div>
    <?php endif; ?>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-sm text-slate-500">Total Reservations</p>
            <p class="text-3xl font-bold text-slate-900 mt-2"><?php echo number_format($totalReservations); ?></p>
        </article>

        <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-sm text-slate-500">Pending Today</p>
            <p class="text-3xl font-bold text-amber-600 mt-2"><?php echo number_format($pendingToday); ?></p>
        </article>

        <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-sm text-slate-500">Completed</p>
            <p class="text-3xl font-bold text-emerald-600 mt-2"><?php echo number_format($completedReservations); ?></p>
        </article>
    </div>

    <section class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div class="px-4 py-3 border-b border-slate-200">
            <h2 class="font-semibold text-slate-900">Reservations</h2>
        </div>

        <?php if (empty($reservations)): ?>
            <div class="p-8 text-center text-slate-600">
                Chua co reservation nao trong he thong.
            </div>
        <?php else: ?>
            <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                    <thead class="bg-slate-100 text-slate-700">
                        <tr>
                            <th class="text-left px-4 py-3">ID</th>
                            <th class="text-left px-4 py-3">Guest Name</th>
                            <th class="text-left px-4 py-3">Phone</th>
                            <th class="text-left px-4 py-3">Date/Time</th>
                            <th class="text-left px-4 py-3">Table</th>
                            <th class="text-center px-4 py-3">People</th>
                            <th class="text-left px-4 py-3">Latest Order</th>
                            <th class="text-left px-4 py-3">Payment</th>
                            <th class="text-left px-4 py-3">Status</th>
                            <th class="text-left px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200">
                        <?php foreach ($reservations as $row): ?>
                            <?php
                            $reservationId = (string) $row['id'];
                            $guestName = (string) $row['guest_name'];
                            $guestPhone = (string) $row['guest_phone'];
                            $guestCount = (int) $row['guest_count'];
                            $status = (string) $row['status'];
                            $reservationTime = (string) $row['reservation_time'];
                            $tableNumber = trim((string) ($row['table_number'] ?? ''));
                            $orderId = trim((string) ($row['order_id'] ?? ''));
                            $orderStatus = trim((string) ($row['order_status'] ?? ''));
                            $paymentStatus = trim((string) ($row['payment_status'] ?? ''));
                            $orderTotal = isset($row['order_total']) ? (float) $row['order_total'] : 0.0;

                            $formattedDateTime = $reservationTime;
                            $timestamp = strtotime($reservationTime);
                            if ($timestamp !== false) {
                                $formattedDateTime = date('d/m/Y H:i', $timestamp);
                            }

                            [$statusLabel, $statusClass] = $statusBadge($status);
                            ?>
                            <tr>
                                <td class="px-4 py-3 font-mono text-xs text-slate-600" title="<?php echo htmlspecialchars($reservationId, ENT_QUOTES, 'UTF-8'); ?>">
                                    <?php echo htmlspecialchars(substr($reservationId, 0, 8), ENT_QUOTES, 'UTF-8'); ?>...
                                </td>
                                <td class="px-4 py-3 font-medium text-slate-800">
                                    <?php echo htmlspecialchars($guestName, ENT_QUOTES, 'UTF-8'); ?>
                                </td>
                                <td class="px-4 py-3 text-slate-700">
                                    <?php echo htmlspecialchars($guestPhone, ENT_QUOTES, 'UTF-8'); ?>
                                </td>
                                <td class="px-4 py-3 text-slate-700 whitespace-nowrap">
                                    <?php echo htmlspecialchars($formattedDateTime, ENT_QUOTES, 'UTF-8'); ?>
                                </td>
                                <td class="px-4 py-3 text-slate-700 whitespace-nowrap">
                                    <?php echo $tableNumber !== '' ? htmlspecialchars($tableNumber, ENT_QUOTES, 'UTF-8') : '-'; ?>
                                </td>
                                <td class="px-4 py-3 text-center font-semibold text-slate-800">
                                    <?php echo $guestCount; ?>
                                </td>
                                <td class="px-4 py-3 text-slate-700">
                                    <?php if ($orderId !== ''): ?>
                                        <div class="font-medium text-slate-800">#<?php echo htmlspecialchars(substr($orderId, 0, 8), ENT_QUOTES, 'UTF-8'); ?>...</div>
                                        <div class="text-xs text-slate-500">
                                            <?php echo htmlspecialchars(ucfirst($orderStatus !== '' ? $orderStatus : 'unknown'), ENT_QUOTES, 'UTF-8'); ?>
                                            -
                                            <?php echo number_format($orderTotal, 0, ',', '.'); ?> VND
                                        </div>
                                    <?php else: ?>
                                        <span class="text-slate-400">Chua co order</span>
                                    <?php endif; ?>
                                </td>
                                <td class="px-4 py-3 text-slate-700">
                                    <?php if ($paymentStatus !== ''): ?>
                                        <?php echo htmlspecialchars(ucfirst($paymentStatus), ENT_QUOTES, 'UTF-8'); ?>
                                    <?php else: ?>
                                        <span class="text-slate-400">-</span>
                                    <?php endif; ?>
                                </td>
                                <td class="px-4 py-3">
                                    <span class="inline-flex rounded-full border px-2 py-1 text-xs font-semibold <?php echo $statusClass; ?>">
                                        <?php echo htmlspecialchars($statusLabel, ENT_QUOTES, 'UTF-8'); ?>
                                    </span>
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex flex-wrap gap-2">
                                        <form method="POST" action="admin_orders.php" class="inline">
                                            <input type="hidden" name="action" value="update_status">
                                            <input type="hidden" name="reservation_id" value="<?php echo htmlspecialchars($reservationId, ENT_QUOTES, 'UTF-8'); ?>">
                                            <input type="hidden" name="status" value="confirmed">
                                            <button type="submit" class="rounded-md bg-emerald-600 text-white px-2.5 py-1.5 text-xs font-medium hover:bg-emerald-700 transition-colors">
                                                Confirm
                                            </button>
                                        </form>

                                        <form method="POST" action="admin_orders.php" class="inline">
                                            <input type="hidden" name="action" value="update_status">
                                            <input type="hidden" name="reservation_id" value="<?php echo htmlspecialchars($reservationId, ENT_QUOTES, 'UTF-8'); ?>">
                                            <input type="hidden" name="status" value="completed">
                                            <button type="submit" class="rounded-md bg-blue-600 text-white px-2.5 py-1.5 text-xs font-medium hover:bg-blue-700 transition-colors">
                                                Complete
                                            </button>
                                        </form>

                                        <form method="POST" action="admin_orders.php" class="inline">
                                            <input type="hidden" name="action" value="update_status">
                                            <input type="hidden" name="reservation_id" value="<?php echo htmlspecialchars($reservationId, ENT_QUOTES, 'UTF-8'); ?>">
                                            <input type="hidden" name="status" value="cancelled">
                                            <button type="submit" class="rounded-md bg-red-600 text-white px-2.5 py-1.5 text-xs font-medium hover:bg-red-700 transition-colors">
                                                Cancel
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    </section>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>
