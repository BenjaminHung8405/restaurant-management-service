<?php
declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require __DIR__ . '/db.php';

$uuidV4 = static function (): string {
    $data = random_bytes(16);
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);

    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
};

$cart = isset($_SESSION['cart']) && is_array($_SESSION['cart']) ? $_SESSION['cart'] : [];
$normalizedCart = [];

foreach ($cart as $id => $quantity) {
    $itemId = trim((string) $id);
    $itemQty = (int) $quantity;

    if ($itemId !== '' && $itemQty > 0) {
        $normalizedCart[$itemId] = $itemQty;
    }
}

$_SESSION['cart'] = $normalizedCart;
$cart = $normalizedCart;

if (empty($cart)) {
    header('Location: menu.php');
    exit;
}

$cartItems = [];
$grandTotal = 0.0;
$errorMessage = '';

try {
    $itemIds = array_keys($cart);
    $placeholders = implode(',', array_fill(0, count($itemIds), '?'));

    $itemSql = "
        SELECT id, name, price, image_url
        FROM menu_items
        WHERE id IN ($placeholders)
    ";

    $itemStmt = $pdo->prepare($itemSql);
    $itemStmt->execute($itemIds);
    $rows = $itemStmt->fetchAll();

    $foundIds = [];

    foreach ($rows as $row) {
        $id = (string) $row['id'];
        $quantity = (int) $cart[$id];
        $price = (float) $row['price'];
        $subtotal = $price * $quantity;

        $cartItems[] = [
            'id' => $id,
            'name' => (string) $row['name'],
            'price' => $price,
            'image_url' => (string) ($row['image_url'] ?? ''),
            'quantity' => $quantity,
            'subtotal' => $subtotal,
        ];

        $grandTotal += $subtotal;
        $foundIds[] = $id;
    }

    foreach (array_keys($cart) as $id) {
        if (!in_array($id, $foundIds, true)) {
            unset($_SESSION['cart'][$id]);
        }
    }

    if (empty($cartItems)) {
        header('Location: menu.php');
        exit;
    }

    usort($cartItems, static function (array $a, array $b): int {
        return strcmp($a['name'], $b['name']);
    });
} catch (PDOException $exception) {
    error_log('reservation.php cart query error: ' . $exception->getMessage());
    $errorMessage = 'Khong the tai du lieu don hang. Vui long thu lai.';
}

$formData = [
    'guest_name' => '',
    'guest_phone' => '',
    'reservation_date' => '',
    'reservation_time' => '',
    'party_size' => 2,
    'notes' => '',
];

$validationErrors = [];
$success = false;
$reservationId = '';
$orderId = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $errorMessage === '') {
    $formData['guest_name'] = isset($_POST['guest_name']) ? trim((string) $_POST['guest_name']) : '';
    $formData['guest_phone'] = isset($_POST['guest_phone']) ? trim((string) $_POST['guest_phone']) : '';
    $formData['reservation_date'] = isset($_POST['reservation_date']) ? trim((string) $_POST['reservation_date']) : '';
    $formData['reservation_time'] = isset($_POST['reservation_time']) ? trim((string) $_POST['reservation_time']) : '';
    $formData['party_size'] = isset($_POST['party_size']) ? max(1, (int) $_POST['party_size']) : 1;
    $formData['notes'] = isset($_POST['notes']) ? trim((string) $_POST['notes']) : '';

    if ($formData['guest_name'] === '') {
        $validationErrors[] = 'Vui long nhap ten khach.';
    }

    if ($formData['guest_phone'] === '') {
        $validationErrors[] = 'Vui long nhap so dien thoai.';
    }

    if ($formData['reservation_date'] === '') {
        $validationErrors[] = 'Vui long chon ngay dat ban.';
    }

    if ($formData['reservation_time'] === '') {
        $validationErrors[] = 'Vui long chon gio dat ban.';
    }

    $reservationDateTime = null;

    if ($formData['reservation_date'] !== '' && $formData['reservation_time'] !== '') {
        $dateTimeString = $formData['reservation_date'] . ' ' . $formData['reservation_time'] . ':00';
        $reservationDateTime = date('Y-m-d H:i:s', strtotime($dateTimeString));

        if ($reservationDateTime === false || $reservationDateTime === '1970-01-01 00:00:00') {
            $validationErrors[] = 'Ngay gio dat ban khong hop le.';
        }
    }

    if (empty($validationErrors)) {
        try {
            $pdo->beginTransaction();

            $reservationId = $uuidV4();

            $reservationSql = '
                INSERT INTO reservations (
                    id,
                    user_id,
                    table_id,
                    reservation_time,
                    guest_count,
                    guest_name,
                    guest_phone,
                    notes,
                    status
                ) VALUES (
                    :id,
                    NULL,
                    NULL,
                    :reservation_time,
                    :guest_count,
                    :guest_name,
                    :guest_phone,
                    :notes,
                    :status
                )
            ';

            $reservationStmt = $pdo->prepare($reservationSql);
            $reservationStmt->execute([
                'id' => $reservationId,
                'reservation_time' => $reservationDateTime,
                'guest_count' => $formData['party_size'],
                'guest_name' => $formData['guest_name'],
                'guest_phone' => $formData['guest_phone'],
                'notes' => $formData['notes'] !== '' ? $formData['notes'] : null,
                'status' => 'pending',
            ]);

            $tableId = null;

            $tableStmt = $pdo->prepare('
                SELECT id
                FROM tables
                WHERE status = :status AND capacity >= :guest_count
                ORDER BY capacity ASC
                LIMIT 1
            ');
            $tableStmt->execute([
                'status' => 'available',
                'guest_count' => $formData['party_size'],
            ]);
            $tableId = $tableStmt->fetchColumn();

            if ($tableId === false) {
                $fallbackTableStmt = $pdo->prepare('
                    SELECT id
                    FROM tables
                    WHERE status = :status
                    ORDER BY capacity ASC
                    LIMIT 1
                ');
                $fallbackTableStmt->execute(['status' => 'available']);
                $tableId = $fallbackTableStmt->fetchColumn();
            }

            if (is_string($tableId) && $tableId !== '') {
                $orderId = $uuidV4();

                $orderSql = '
                    INSERT INTO orders (
                        id,
                        user_id,
                        table_id,
                        total_amount,
                        order_status,
                        payment_status
                    ) VALUES (
                        :id,
                        NULL,
                        :table_id,
                        :total_amount,
                        :order_status,
                        :payment_status
                    )
                ';

                $orderStmt = $pdo->prepare($orderSql);
                $orderStmt->execute([
                    'id' => $orderId,
                    'table_id' => $tableId,
                    'total_amount' => $grandTotal,
                    'order_status' => 'pending',
                    'payment_status' => 'unpaid',
                ]);

                $orderItemSql = '
                    INSERT INTO order_items (
                        id,
                        order_id,
                        menu_item_id,
                        quantity,
                        unit_price,
                        notes
                    ) VALUES (
                        :id,
                        :order_id,
                        :menu_item_id,
                        :quantity,
                        :unit_price,
                        :notes
                    )
                ';

                $orderItemStmt = $pdo->prepare($orderItemSql);

                foreach ($cartItems as $item) {
                    $orderItemStmt->execute([
                        'id' => $uuidV4(),
                        'order_id' => $orderId,
                        'menu_item_id' => $item['id'],
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['price'],
                        'notes' => null,
                    ]);
                }
            }

            $pdo->commit();

            $success = true;
            unset($_SESSION['cart']);
        } catch (Throwable $exception) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }

            error_log('reservation.php transaction error: ' . $exception->getMessage());
            $validationErrors[] = 'Dat ban that bai. Vui long thu lai.';
        }
    }
}

$pageTitle = 'Dat ban / Thanh toan';
require __DIR__ . '/includes/header.php';
?>

<section class="mb-6">
    <h1 class="text-2xl md:text-3xl font-bold text-slate-900">Dat ban / Thanh toan</h1>
    <p class="text-slate-600 mt-1">Hoan tat thong tin khach hang de gui don dat ban.</p>
</section>

<?php if ($errorMessage !== ''): ?>
    <section class="mb-6">
        <div class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <?php echo htmlspecialchars($errorMessage, ENT_QUOTES, 'UTF-8'); ?>
        </div>
    </section>
<?php endif; ?>

<?php if ($success): ?>
    <section>
        <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 md:p-8">
            <h2 class="text-2xl font-bold text-emerald-800 mb-2">Dat ban thanh cong</h2>
            <p class="text-emerald-700 mb-4">Cam on ban. Nha hang da nhan thong tin dat ban cua ban.</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <p><span class="font-semibold">Ma reservation:</span> <?php echo htmlspecialchars($reservationId, ENT_QUOTES, 'UTF-8'); ?></p>
                <p><span class="font-semibold">Tong tien tam tinh:</span> <?php echo number_format($grandTotal, 0, ',', '.'); ?> VND</p>
                <?php if ($orderId !== ''): ?>
                    <p><span class="font-semibold">Ma order:</span> <?php echo htmlspecialchars($orderId, ENT_QUOTES, 'UTF-8'); ?></p>
                <?php endif; ?>
            </div>

            <div class="mt-6 flex flex-wrap gap-3">
                <a href="menu.php" class="inline-flex items-center rounded-lg bg-teal-600 text-white px-4 py-2 font-medium hover:bg-teal-700 transition-colors">
                    Quay lai thuc don
                </a>
                <a href="index.php" class="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 font-medium hover:bg-slate-100 transition-colors">
                    Ve trang chu
                </a>
            </div>
        </div>
    </section>
<?php else: ?>
    <?php if (!empty($validationErrors)): ?>
        <section class="mb-6">
            <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                <p class="font-semibold mb-2">Vui long kiem tra lai:</p>
                <ul class="list-disc pl-5 space-y-1">
                    <?php foreach ($validationErrors as $validationError): ?>
                        <li><?php echo htmlspecialchars($validationError, ENT_QUOTES, 'UTF-8'); ?></li>
                    <?php endforeach; ?>
                </ul>
            </div>
        </section>
    <?php endif; ?>

    <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
            <div class="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm">
                <h2 class="text-xl font-semibold text-slate-900 mb-4">Thong tin dat ban</h2>

                <form method="POST" action="reservation.php" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="guest_name" class="block text-sm font-medium text-slate-700 mb-1">Ho ten</label>
                            <input
                                id="guest_name"
                                name="guest_name"
                                type="text"
                                value="<?php echo htmlspecialchars($formData['guest_name'], ENT_QUOTES, 'UTF-8'); ?>"
                                class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                                required
                            >
                        </div>

                        <div>
                            <label for="guest_phone" class="block text-sm font-medium text-slate-700 mb-1">So dien thoai</label>
                            <input
                                id="guest_phone"
                                name="guest_phone"
                                type="text"
                                value="<?php echo htmlspecialchars($formData['guest_phone'], ENT_QUOTES, 'UTF-8'); ?>"
                                class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                                required
                            >
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label for="reservation_date" class="block text-sm font-medium text-slate-700 mb-1">Ngay dat ban</label>
                            <input
                                id="reservation_date"
                                name="reservation_date"
                                type="date"
                                value="<?php echo htmlspecialchars($formData['reservation_date'], ENT_QUOTES, 'UTF-8'); ?>"
                                class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                                required
                            >
                        </div>

                        <div>
                            <label for="reservation_time" class="block text-sm font-medium text-slate-700 mb-1">Gio dat ban</label>
                            <input
                                id="reservation_time"
                                name="reservation_time"
                                type="time"
                                value="<?php echo htmlspecialchars($formData['reservation_time'], ENT_QUOTES, 'UTF-8'); ?>"
                                class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                                required
                            >
                        </div>

                        <div>
                            <label for="party_size" class="block text-sm font-medium text-slate-700 mb-1">So nguoi</label>
                            <input
                                id="party_size"
                                name="party_size"
                                type="number"
                                min="1"
                                max="20"
                                value="<?php echo (int) $formData['party_size']; ?>"
                                class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                            >
                        </div>
                    </div>

                    <div>
                        <label for="notes" class="block text-sm font-medium text-slate-700 mb-1">Ghi chu</label>
                        <textarea
                            id="notes"
                            name="notes"
                            rows="4"
                            class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Vi du: khong hanh, ban gan cua so..."
                        ><?php echo htmlspecialchars($formData['notes'], ENT_QUOTES, 'UTF-8'); ?></textarea>
                    </div>

                    <div class="pt-2 flex flex-wrap items-center gap-3">
                        <button
                            type="submit"
                            class="inline-flex items-center rounded-lg bg-teal-600 text-white px-5 py-2.5 font-semibold hover:bg-teal-700 transition-colors"
                        >
                            Xac nhan dat ban
                        </button>
                        <a
                            href="cart.php"
                            class="inline-flex items-center rounded-lg border border-slate-300 px-5 py-2.5 font-semibold hover:bg-slate-100 transition-colors"
                        >
                            Quay lai gio hang
                        </a>
                    </div>
                </form>
            </div>
        </div>

        <div class="lg:col-span-1">
            <div class="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm sticky top-6">
                <h2 class="text-lg font-semibold text-slate-900 mb-4">Order Summary</h2>

                <div class="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    <?php foreach ($cartItems as $item): ?>
                        <div class="flex items-start gap-3 border-b border-slate-100 pb-3">
                            <?php if ($item['image_url'] !== ''): ?>
                                <img
                                    src="<?php echo htmlspecialchars($item['image_url'], ENT_QUOTES, 'UTF-8'); ?>"
                                    alt="<?php echo htmlspecialchars($item['name'], ENT_QUOTES, 'UTF-8'); ?>"
                                    class="w-14 h-14 rounded-lg object-cover border border-slate-200"
                                >
                            <?php else: ?>
                                <div class="w-14 h-14 rounded-lg bg-slate-200 border border-slate-200"></div>
                            <?php endif; ?>

                            <div class="min-w-0 flex-1">
                                <p class="font-medium text-slate-800 leading-tight">
                                    <?php echo htmlspecialchars($item['name'], ENT_QUOTES, 'UTF-8'); ?>
                                </p>
                                <p class="text-sm text-slate-500 mt-1">
                                    <?php echo (int) $item['quantity']; ?> x <?php echo number_format((float) $item['price'], 0, ',', '.'); ?> VND
                                </p>
                            </div>

                            <p class="font-semibold text-slate-800 whitespace-nowrap">
                                <?php echo number_format((float) $item['subtotal'], 0, ',', '.'); ?>
                            </p>
                        </div>
                    <?php endforeach; ?>
                </div>

                <div class="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                    <span class="text-slate-600">Grand Total</span>
                    <span class="text-xl font-bold text-teal-700">
                        <?php echo number_format($grandTotal, 0, ',', '.'); ?> VND
                    </span>
                </div>
            </div>
        </div>
    </section>
<?php endif; ?>

<?php require __DIR__ . '/includes/footer.php'; ?>
