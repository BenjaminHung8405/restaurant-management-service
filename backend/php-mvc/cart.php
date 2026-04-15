<?php
declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require __DIR__ . '/db.php';

$pageTitle = 'Giỏ hàng';
$cart = isset($_SESSION['cart']) && is_array($_SESSION['cart']) ? $_SESSION['cart'] : [];
$cartItems = [];
$grandTotal = 0.0;
$errorMessage = '';

if (!empty($cart)) {
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

    if (!empty($cart)) {
        try {
            $itemIds = array_keys($cart);
            $placeholders = implode(',', array_fill(0, count($itemIds), '?'));

            $sql = "
                SELECT id, name, price, image_url
                FROM menu_items
                WHERE id IN ($placeholders)
            ";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($itemIds);
            $rows = $stmt->fetchAll();

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

            usort($cartItems, static function (array $a, array $b): int {
                return strcmp($a['name'], $b['name']);
            });
        } catch (PDOException $exception) {
            $errorMessage = 'Không thể tải dữ liệu giỏ hàng. Vui lòng thử lại.';
            error_log('cart.php database error: ' . $exception->getMessage());
        }
    }
}

require __DIR__ . '/includes/header.php';
?>

<section class="mb-6">
    <h1 class="text-2xl md:text-3xl font-bold text-slate-900">Giỏ hàng</h1>
    <p class="text-slate-600 mt-1">Xem lại món đã chọn trước khi đặt bàn/thanh toán.</p>
</section>

<?php if ($errorMessage !== ''): ?>
    <section class="mb-6">
        <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <?php echo htmlspecialchars($errorMessage, ENT_QUOTES, 'UTF-8'); ?>
        </div>
    </section>
<?php endif; ?>

<?php if (empty($cartItems)): ?>
    <section>
        <div class="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <h2 class="text-xl font-semibold text-slate-800 mb-2">Giỏ hàng trống</h2>
            <p class="text-slate-600 mb-4">Bạn chưa thêm món nào vào giỏ hàng.</p>
            <a
                href="menu.php"
                class="inline-flex items-center rounded-lg bg-teal-600 text-white px-4 py-2 font-medium hover:bg-teal-700 transition-colors"
            >
                Quay lại thực đơn
            </a>
        </div>
    </section>
<?php else: ?>
    <section class="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead class="bg-slate-100 text-slate-700">
                    <tr>
                        <th class="text-left px-4 py-3">Món ăn</th>
                        <th class="text-right px-4 py-3">Đơn giá</th>
                        <th class="text-center px-4 py-3">Số lượng</th>
                        <th class="text-right px-4 py-3">Tạm tính</th>
                        <th class="text-center px-4 py-3">Xử lý</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                    <?php foreach ($cartItems as $item): ?>
                        <?php
                        $id = (string) $item['id'];
                        $name = (string) $item['name'];
                        $price = (float) $item['price'];
                        $quantity = (int) $item['quantity'];
                        $subtotal = (float) $item['subtotal'];
                        $imageUrl = (string) $item['image_url'];
                        ?>
                        <tr>
                            <td class="px-4 py-3">
                                <div class="flex items-center gap-3 min-w-[240px]">
                                    <?php if ($imageUrl !== ''): ?>
                                        <img
                                            src="<?php echo htmlspecialchars($imageUrl, ENT_QUOTES, 'UTF-8'); ?>"
                                            alt="<?php echo htmlspecialchars($name, ENT_QUOTES, 'UTF-8'); ?>"
                                            class="w-14 h-14 rounded object-cover border border-slate-200"
                                        >
                                    <?php else: ?>
                                        <div class="w-14 h-14 rounded bg-slate-200 border border-slate-200"></div>
                                    <?php endif; ?>
                                    <span class="font-medium text-slate-800">
                                        <?php echo htmlspecialchars($name, ENT_QUOTES, 'UTF-8'); ?>
                                    </span>
                                </div>
                            </td>

                            <td class="px-4 py-3 text-right font-medium text-slate-700 whitespace-nowrap">
                                <?php echo number_format($price, 0, ',', '.'); ?> VND
                            </td>

                            <td class="px-4 py-3">
                                <div class="flex items-center justify-center gap-2">
                                    <a
                                        href="cart_actions.php?action=update&id=<?php echo urlencode($id); ?>&quantity=<?php echo max(0, $quantity - 1); ?>"
                                        class="inline-flex w-8 h-8 items-center justify-center rounded border border-slate-300 hover:bg-slate-100"
                                        aria-label="Giảm số lượng"
                                    >
                                        -
                                    </a>

                                    <span class="inline-flex min-w-8 justify-center font-semibold text-slate-800">
                                        <?php echo $quantity; ?>
                                    </span>

                                    <a
                                        href="cart_actions.php?action=update&id=<?php echo urlencode($id); ?>&quantity=<?php echo $quantity + 1; ?>"
                                        class="inline-flex w-8 h-8 items-center justify-center rounded border border-slate-300 hover:bg-slate-100"
                                        aria-label="Tăng số lượng"
                                    >
                                        +
                                    </a>
                                </div>
                            </td>

                            <td class="px-4 py-3 text-right font-semibold text-teal-700 whitespace-nowrap">
                                <?php echo number_format($subtotal, 0, ',', '.'); ?> VND
                            </td>

                            <td class="px-4 py-3 text-center">
                                <a
                                    href="cart_actions.php?action=remove&id=<?php echo urlencode($id); ?>"
                                    class="text-red-600 hover:text-red-700 font-medium"
                                >
                                    Xóa
                                </a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>

        <div class="border-t border-slate-200 p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <p class="text-slate-600">Tổng tiền</p>
                <p class="text-2xl font-bold text-teal-700">
                    <?php echo number_format($grandTotal, 0, ',', '.'); ?> VND
                </p>
            </div>

            <div class="flex items-center gap-3">
                <a
                    href="menu.php"
                    class="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 font-medium hover:bg-slate-100 transition-colors"
                >
                    Thêm món
                </a>
                <a
                    href="reservation.php"
                    class="inline-flex items-center rounded-lg bg-teal-600 text-white px-4 py-2 font-medium hover:bg-teal-700 transition-colors"
                >
                    Tiến hành Đặt bàn/Thanh toán
                </a>
            </div>
        </div>
    </section>
<?php endif; ?>

<?php require __DIR__ . '/includes/footer.php'; ?>
