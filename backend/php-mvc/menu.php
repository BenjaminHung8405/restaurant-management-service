<?php
declare(strict_types=1);

require __DIR__ . '/db.php';

$search = isset($_GET['search']) ? trim((string) $_GET['search']) : '';
$categoryId = isset($_GET['category_id']) ? trim((string) $_GET['category_id']) : '';

$categories = [];
$menuItems = [];
$errorMessage = '';

try {
    $categoryStmt = $pdo->query('SELECT id, name FROM categories ORDER BY name ASC');
    $categories = $categoryStmt->fetchAll();

    $sql = '
        SELECT
            m.id,
            m.name,
            m.description,
            m.price,
            m.image_url,
            m.is_available,
            c.id AS category_id,
            c.name AS category_name
        FROM menu_items m
        INNER JOIN categories c ON c.id = m.category_id
        WHERE 1 = 1
    ';

    $params = [];

    if ($search !== '') {
        $sql .= ' AND (m.name LIKE :search OR COALESCE(m.description, "") LIKE :search)';
        $params['search'] = '%' . $search . '%';
    }

    if ($categoryId !== '') {
        $sql .= ' AND m.category_id = :category_id';
        $params['category_id'] = $categoryId;
    }

    $sql .= ' ORDER BY m.name ASC';

    $menuStmt = $pdo->prepare($sql);
    $menuStmt->execute($params);
    $menuItems = $menuStmt->fetchAll();
} catch (PDOException $exception) {
    $errorMessage = 'Khong the tai du lieu thuc don. Vui long thu lai sau.';
    error_log('menu.php database error: ' . $exception->getMessage());
}

$buildFilterUrl = static function (string $searchValue, string $categoryValue): string {
    $queryParams = [];

    if ($searchValue !== '') {
        $queryParams['search'] = $searchValue;
    }

    if ($categoryValue !== '') {
        $queryParams['category_id'] = $categoryValue;
    }

    $queryString = http_build_query($queryParams);
    return 'menu.php' . ($queryString !== '' ? '?' . $queryString : '');
};

$pageTitle = 'Thuc don';
require __DIR__ . '/includes/header.php';
?>

<section class="mb-6">
    <div class="bg-white border border-slate-200 rounded-xl p-4 md:p-5">
        <h1 class="text-2xl font-bold text-slate-900 mb-4">Thuc don</h1>

        <form method="GET" action="menu.php" class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div class="md:col-span-2">
                <label for="search" class="block text-sm font-medium text-slate-700 mb-1">Tim mon</label>
                <input
                    id="search"
                    name="search"
                    type="text"
                    value="<?php echo htmlspecialchars($search, ENT_QUOTES, 'UTF-8'); ?>"
                    placeholder="Nhap ten mon an..."
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                >
            </div>

            <div>
                <label for="category_id" class="block text-sm font-medium text-slate-700 mb-1">Danh muc</label>
                <select
                    id="category_id"
                    name="category_id"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-teal-500"
                >
                    <option value="">Tat ca danh muc</option>
                    <?php foreach ($categories as $category): ?>
                        <?php $optionId = (string) $category['id']; ?>
                        <option
                            value="<?php echo htmlspecialchars($optionId, ENT_QUOTES, 'UTF-8'); ?>"
                            <?php echo $categoryId === $optionId ? 'selected' : ''; ?>
                        >
                            <?php echo htmlspecialchars((string) $category['name'], ENT_QUOTES, 'UTF-8'); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="flex items-end gap-2">
                <button
                    type="submit"
                    class="w-full rounded-lg bg-teal-600 text-white py-2 px-4 font-medium hover:bg-teal-700 transition-colors"
                >
                    Loc
                </button>
                <a
                    href="menu.php"
                    class="w-full text-center rounded-lg border border-slate-300 py-2 px-4 font-medium hover:bg-slate-100 transition-colors"
                >
                    Xoa
                </a>
            </div>
        </form>

        <div class="mt-4 flex flex-wrap gap-2">
            <?php
            $allActive = $categoryId === '';
            $allButtonClasses = $allActive
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100';
            ?>
            <a
                href="<?php echo htmlspecialchars($buildFilterUrl($search, ''), ENT_QUOTES, 'UTF-8'); ?>"
                class="inline-flex items-center rounded-full border px-3 py-1 text-sm <?php echo $allButtonClasses; ?>"
            >
                Tat ca
            </a>

            <?php foreach ($categories as $category): ?>
                <?php
                $currentCategoryId = (string) $category['id'];
                $isActive = $categoryId === $currentCategoryId;
                $buttonClasses = $isActive
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100';
                ?>
                <a
                    href="<?php echo htmlspecialchars($buildFilterUrl($search, $currentCategoryId), ENT_QUOTES, 'UTF-8'); ?>"
                    class="inline-flex items-center rounded-full border px-3 py-1 text-sm <?php echo $buttonClasses; ?>"
                >
                    <?php echo htmlspecialchars((string) $category['name'], ENT_QUOTES, 'UTF-8'); ?>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<?php if ($errorMessage !== ''): ?>
    <section class="mb-6">
        <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <?php echo htmlspecialchars($errorMessage, ENT_QUOTES, 'UTF-8'); ?>
        </div>
    </section>
<?php endif; ?>

<?php if (!empty($menuItems)): ?>
    <section>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <?php foreach ($menuItems as $item): ?>
                <article class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <?php if (!empty($item['image_url'])): ?>
                        <img
                            src="<?php echo htmlspecialchars((string) $item['image_url'], ENT_QUOTES, 'UTF-8'); ?>"
                            alt="<?php echo htmlspecialchars((string) $item['name'], ENT_QUOTES, 'UTF-8'); ?>"
                            class="w-full h-48 object-cover"
                        >
                    <?php else: ?>
                        <div class="w-full h-48 bg-slate-200 flex items-center justify-center text-slate-500 text-sm">
                            Khong co hinh anh
                        </div>
                    <?php endif; ?>

                    <div class="p-4">
                        <div class="flex items-start justify-between gap-3 mb-2">
                            <h2 class="font-semibold text-lg text-slate-900 leading-tight">
                                <?php echo htmlspecialchars((string) $item['name'], ENT_QUOTES, 'UTF-8'); ?>
                            </h2>
                            <?php if ((int) $item['is_available'] === 1): ?>
                                <span class="shrink-0 text-xs rounded-full bg-emerald-100 text-emerald-700 px-2 py-1">San sang</span>
                            <?php else: ?>
                                <span class="shrink-0 text-xs rounded-full bg-amber-100 text-amber-700 px-2 py-1">Tam dung</span>
                            <?php endif; ?>
                        </div>

                        <p class="text-sm text-slate-500 mb-1">
                            Danh muc: <span class="font-medium text-slate-700"><?php echo htmlspecialchars((string) $item['category_name'], ENT_QUOTES, 'UTF-8'); ?></span>
                        </p>

                        <p class="text-sm text-slate-600 mb-3 min-h-[40px]">
                            <?php
                            $description = trim((string) ($item['description'] ?? ''));
                            echo htmlspecialchars($description !== '' ? $description : 'Mon an dang cap nhat mo ta.', ENT_QUOTES, 'UTF-8');
                            ?>
                        </p>

                        <div class="flex items-center justify-between">
                            <p class="font-bold text-teal-700 text-lg">
                                <?php echo number_format((float) $item['price'], 0, ',', '.'); ?> VND
                            </p>

                            <a
                                href="cart_actions.php?action=add&id=<?php echo urlencode((string) $item['id']); ?>"
                                class="inline-flex items-center rounded-lg bg-teal-600 text-white text-sm font-medium px-3 py-2 hover:bg-teal-700 transition-colors"
                            >
                                Them vao gio
                            </a>
                        </div>
                    </div>
                </article>
            <?php endforeach; ?>
        </div>
    </section>
<?php else: ?>
    <section>
        <div class="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <p class="text-slate-600">Khong tim thay mon an phu hop voi bo loc hien tai.</p>
            <a href="menu.php" class="inline-block mt-3 text-teal-700 font-medium hover:text-teal-800">Xem toan bo thuc don</a>
        </div>
    </section>
<?php endif; ?>

<?php require __DIR__ . '/includes/footer.php'; ?>
