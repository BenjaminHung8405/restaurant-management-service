<?php
declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require __DIR__ . '/db.php';

$currentUser = isset($_SESSION['user']) && is_array($_SESSION['user']) ? $_SESSION['user'] : null;
$currentRole = strtolower(trim((string) ($currentUser['role'] ?? '')));

if (!$currentUser || !in_array($currentRole, ['admin', 'staff'], true)) {
    $_SESSION['auth_error'] = 'Ban khong co quyen truy cap trang quan tri menu.';
    header('Location: login.php?error=' . urlencode('Ban khong co quyen truy cap trang quan tri menu.'));
    exit;
}

$uploadDirectory = __DIR__ . '/assets/uploads';
$uploadWebPrefix = 'assets/uploads/';
$maxImageBytes = 2 * 1024 * 1024;

$uuidV4 = static function (): string {
    $data = random_bytes(16);
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);

    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
};

$deleteLocalImage = static function (string $imageUrl) use ($uploadWebPrefix): void {
    $normalized = trim(str_replace('\\', '/', $imageUrl));

    if ($normalized === '' || strpos($normalized, '://') !== false || strpos($normalized, '..') !== false) {
        return;
    }

    if (strpos($normalized, $uploadWebPrefix) !== 0) {
        return;
    }

    $fileName = basename($normalized);
    if ($fileName === '' || $fileName === '.' || $fileName === '..') {
        return;
    }

    $absolutePath = __DIR__ . '/assets/uploads/' . $fileName;

    if (is_file($absolutePath)) {
        @unlink($absolutePath);
    }
};

$saveUploadedImage = static function (array $file, array &$errors) use ($uploadDirectory, $uploadWebPrefix, $maxImageBytes): ?string {
    $errorCode = isset($file['error']) ? (int) $file['error'] : UPLOAD_ERR_NO_FILE;

    if ($errorCode === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    if ($errorCode !== UPLOAD_ERR_OK) {
        $errors[] = 'Tai anh that bai. Vui long chon lai file hinh.';
        return null;
    }

    $tmpName = isset($file['tmp_name']) ? (string) $file['tmp_name'] : '';
    if ($tmpName === '' || !is_uploaded_file($tmpName)) {
        $errors[] = 'File upload khong hop le.';
        return null;
    }

    $fileSize = isset($file['size']) ? (int) $file['size'] : 0;
    if ($fileSize <= 0 || $fileSize > $maxImageBytes) {
        $errors[] = 'Kich thuoc anh toi da 2MB.';
        return null;
    }

    $allowedMimeToExtension = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
    ];

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = (string) $finfo->file($tmpName);

    if (!isset($allowedMimeToExtension[$mimeType])) {
        $errors[] = 'Chi chap nhan file JPG, PNG, WEBP hoac GIF.';
        return null;
    }

    if (!is_dir($uploadDirectory) && !mkdir($uploadDirectory, 0775, true) && !is_dir($uploadDirectory)) {
        $errors[] = 'Khong the tao thu muc upload anh.';
        return null;
    }

    try {
        $randomToken = bin2hex(random_bytes(8));
    } catch (Throwable $exception) {
        $errors[] = 'Khong the tao ten file anh duy nhat.';
        return null;
    }

    $fileName = 'menu-' . date('YmdHis') . '-' . $randomToken . '.' . $allowedMimeToExtension[$mimeType];
    $destinationPath = $uploadDirectory . DIRECTORY_SEPARATOR . $fileName;

    if (!move_uploaded_file($tmpName, $destinationPath)) {
        $errors[] = 'Luu file anh that bai. Vui long thu lai.';
        return null;
    }

    return $uploadWebPrefix . $fileName;
};

$flashSuccess = '';
$flashError = '';

if (isset($_SESSION['admin_menu_success'])) {
    $flashSuccess = (string) $_SESSION['admin_menu_success'];
    unset($_SESSION['admin_menu_success']);
}

if (isset($_SESSION['admin_menu_error'])) {
    $flashError = (string) $_SESSION['admin_menu_error'];
    unset($_SESSION['admin_menu_error']);
}

$formErrors = [];
$showForm = isset($_GET['show_form']);
$isEditMode = false;
$formValues = [
    'id' => '',
    'name' => '',
    'category_id' => '',
    'price' => '',
    'description' => '',
    'is_available' => '1',
    'image_url' => '',
];

if ($_SERVER['REQUEST_METHOD'] === 'GET' && (string) ($_GET['action'] ?? '') === 'delete') {
    $deleteId = trim((string) ($_GET['id'] ?? ''));

    if ($deleteId === '') {
        $_SESSION['admin_menu_error'] = 'Yeu cau xoa mon khong hop le.';
        header('Location: admin_menu.php');
        exit;
    }

    try {
        $pdo->beginTransaction();

        $getItemStmt = $pdo->prepare('SELECT image_url FROM menu_items WHERE id = :id LIMIT 1');
        $getItemStmt->execute(['id' => $deleteId]);
        $itemToDelete = $getItemStmt->fetch();

        if (!$itemToDelete) {
            $pdo->rollBack();
            $_SESSION['admin_menu_error'] = 'Khong tim thay mon an can xoa.';
            header('Location: admin_menu.php');
            exit;
        }

        $deleteStmt = $pdo->prepare('DELETE FROM menu_items WHERE id = :id');
        $deleteStmt->execute(['id' => $deleteId]);

        $pdo->commit();

        $deleteLocalImage((string) ($itemToDelete['image_url'] ?? ''));

        $_SESSION['admin_menu_success'] = 'Da xoa mon an thanh cong.';
    } catch (PDOException $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        error_log('admin_menu.php delete error: ' . $exception->getMessage());
        $_SESSION['admin_menu_error'] = 'Xoa mon that bai. Vui long thu lai.';
    }

    header('Location: admin_menu.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $formAction = strtolower(trim((string) ($_POST['form_action'] ?? 'create')));
    $isEditMode = $formAction === 'update';
    $showForm = true;

    $formValues['id'] = trim((string) ($_POST['id'] ?? ''));
    $formValues['name'] = trim((string) ($_POST['name'] ?? ''));
    $formValues['category_id'] = trim((string) ($_POST['category_id'] ?? ''));
    $formValues['price'] = trim((string) ($_POST['price'] ?? ''));
    $formValues['description'] = trim((string) ($_POST['description'] ?? ''));
    $formValues['is_available'] = trim((string) ($_POST['is_available'] ?? '1'));

    if ($formValues['name'] === '' || strlen($formValues['name']) > 255) {
        $formErrors[] = 'Ten mon bat buoc va khong vuot qua 255 ky tu.';
    }

    if ($formValues['category_id'] === '') {
        $formErrors[] = 'Vui long chon danh muc cho mon an.';
    }

    if ($formValues['price'] === '' || !is_numeric($formValues['price'])) {
        $formErrors[] = 'Gia mon phai la mot so hop le.';
    }

    $priceValue = (float) $formValues['price'];
    if ($priceValue < 0) {
        $formErrors[] = 'Gia mon khong duoc am.';
    }

    if (!in_array($formValues['is_available'], ['0', '1'], true)) {
        $formErrors[] = 'Trang thai mon an khong hop le.';
    }

    if (empty($formErrors)) {
        try {
            $categoryCheckStmt = $pdo->prepare('SELECT id FROM categories WHERE id = :id LIMIT 1');
            $categoryCheckStmt->execute(['id' => $formValues['category_id']]);

            if (!$categoryCheckStmt->fetch()) {
                $formErrors[] = 'Danh muc duoc chon khong ton tai.';
            }
        } catch (PDOException $exception) {
            error_log('admin_menu.php category check error: ' . $exception->getMessage());
            $formErrors[] = 'Khong the kiem tra danh muc. Vui long thu lai.';
        }
    }

    $existingImageUrl = '';

    if ($isEditMode && empty($formErrors)) {
        if ($formValues['id'] === '') {
            $formErrors[] = 'Thieu ID mon an de cap nhat.';
        } else {
            try {
                $existingItemStmt = $pdo->prepare('SELECT image_url FROM menu_items WHERE id = :id LIMIT 1');
                $existingItemStmt->execute(['id' => $formValues['id']]);
                $existingItem = $existingItemStmt->fetch();

                if (!$existingItem) {
                    $formErrors[] = 'Khong tim thay mon an can cap nhat.';
                } else {
                    $existingImageUrl = (string) ($existingItem['image_url'] ?? '');
                    $formValues['image_url'] = $existingImageUrl;
                }
            } catch (PDOException $exception) {
                error_log('admin_menu.php load existing item error: ' . $exception->getMessage());
                $formErrors[] = 'Khong the tai thong tin mon an de cap nhat.';
            }
        }
    }

    $uploadedImageUrl = null;

    if (empty($formErrors) && isset($_FILES['image']) && is_array($_FILES['image'])) {
        $uploadedImageUrl = $saveUploadedImage($_FILES['image'], $formErrors);
    }

    if (empty($formErrors)) {
        $imageUrlForSave = $uploadedImageUrl !== null
            ? $uploadedImageUrl
            : ($existingImageUrl !== '' ? $existingImageUrl : null);

        try {
            if ($isEditMode) {
                $updateStmt = $pdo->prepare('
                    UPDATE menu_items
                    SET category_id = :category_id,
                        name = :name,
                        description = :description,
                        price = :price,
                        image_url = :image_url,
                        is_available = :is_available
                    WHERE id = :id
                ');

                $updateStmt->execute([
                    'category_id' => $formValues['category_id'],
                    'name' => $formValues['name'],
                    'description' => $formValues['description'] !== '' ? $formValues['description'] : null,
                    'price' => round($priceValue, 2),
                    'image_url' => $imageUrlForSave,
                    'is_available' => (int) $formValues['is_available'],
                    'id' => $formValues['id'],
                ]);

                if ($uploadedImageUrl !== null && $existingImageUrl !== '' && $existingImageUrl !== $uploadedImageUrl) {
                    $deleteLocalImage($existingImageUrl);
                }

                $_SESSION['admin_menu_success'] = 'Da cap nhat mon an thanh cong.';
            } else {
                $insertStmt = $pdo->prepare('
                    INSERT INTO menu_items (
                        id,
                        category_id,
                        name,
                        description,
                        price,
                        image_url,
                        is_available
                    )
                    VALUES (
                        :id,
                        :category_id,
                        :name,
                        :description,
                        :price,
                        :image_url,
                        :is_available
                    )
                ');

                $insertStmt->execute([
                    'id' => $uuidV4(),
                    'category_id' => $formValues['category_id'],
                    'name' => $formValues['name'],
                    'description' => $formValues['description'] !== '' ? $formValues['description'] : null,
                    'price' => round($priceValue, 2),
                    'image_url' => $imageUrlForSave,
                    'is_available' => (int) $formValues['is_available'],
                ]);

                $_SESSION['admin_menu_success'] = 'Da them mon an moi thanh cong.';
            }

            header('Location: admin_menu.php');
            exit;
        } catch (PDOException $exception) {
            if ($uploadedImageUrl !== null) {
                $deleteLocalImage($uploadedImageUrl);
            }

            error_log('admin_menu.php save error: ' . $exception->getMessage());
            $formErrors[] = 'Luu thong tin mon an that bai. Vui long thu lai.';
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $editId = trim((string) ($_GET['edit'] ?? ''));

    if ($editId !== '') {
        $showForm = true;
        $isEditMode = true;

        try {
            $editStmt = $pdo->prepare('
                SELECT id, name, category_id, price, description, image_url, is_available
                FROM menu_items
                WHERE id = :id
                LIMIT 1
            ');
            $editStmt->execute(['id' => $editId]);
            $editItem = $editStmt->fetch();

            if (!$editItem) {
                $flashError = 'Khong tim thay mon an can sua.';
                $isEditMode = false;
            } else {
                $formValues['id'] = (string) $editItem['id'];
                $formValues['name'] = (string) $editItem['name'];
                $formValues['category_id'] = (string) $editItem['category_id'];
                $formValues['price'] = (string) $editItem['price'];
                $formValues['description'] = trim((string) ($editItem['description'] ?? ''));
                $formValues['is_available'] = (string) ((int) $editItem['is_available']);
                $formValues['image_url'] = trim((string) ($editItem['image_url'] ?? ''));
            }
        } catch (PDOException $exception) {
            error_log('admin_menu.php edit load error: ' . $exception->getMessage());
            $flashError = 'Khong the tai du lieu mon an de sua.';
            $isEditMode = false;
        }
    }
}

$categories = [];
$menuItems = [];
$dataError = '';

try {
    $categoryStmt = $pdo->prepare('SELECT id, name FROM categories ORDER BY name ASC');
    $categoryStmt->execute();
    $categories = $categoryStmt->fetchAll();

    $menuStmt = $pdo->prepare('
        SELECT
            m.id,
            m.name,
            m.price,
            m.image_url,
            m.is_available,
            c.name AS category_name
        FROM menu_items m
        INNER JOIN categories c ON c.id = m.category_id
        ORDER BY m.created_at DESC
    ');
    $menuStmt->execute();
    $menuItems = $menuStmt->fetchAll();
} catch (PDOException $exception) {
    error_log('admin_menu.php fetch data error: ' . $exception->getMessage());
    $dataError = 'Khong the tai danh sach mon an. Vui long thu lai.';
}

$pageTitle = 'Admin Menu Management';
$isEditFromQuery = $_SERVER['REQUEST_METHOD'] === 'GET' && trim((string) ($_GET['edit'] ?? '')) !== '';
require __DIR__ . '/includes/header.php';
?>

<section class="w-full space-y-6">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold text-slate-900">Quan ly Thuc don</h1>
            <p class="text-slate-600">Quan ly cac mon an va danh muc</p>
        </div>
        <button
            id="openDishModalBtn"
            type="button"
            class="inline-flex items-center justify-center rounded-lg bg-orange-500 text-white px-4 py-2.5 font-semibold hover:bg-orange-600 transition-colors"
        >
            Them mon moi
        </button>
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

    <?php if ($dataError !== ''): ?>
        <div class="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
            <?php echo htmlspecialchars($dataError, ENT_QUOTES, 'UTF-8'); ?>
        </div>
    <?php endif; ?>

    <div class="rounded-lg bg-white shadow-sm border border-slate-200 overflow-x-auto">
        <table class="min-w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                    <th class="text-left px-4 py-3">Thumbnail</th>
                    <th class="text-left px-4 py-3">Ten</th>
                    <th class="text-left px-4 py-3">Danh muc</th>
                    <th class="text-right px-4 py-3">Gia</th>
                    <th class="text-right px-4 py-3">Hanh dong</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($menuItems)): ?>
                    <tr>
                        <td colspan="5" class="px-4 py-8 text-center text-slate-500">Chua co mon an nao trong he thong.</td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($menuItems as $item): ?>
                        <?php
                        $itemId = (string) $item['id'];
                        $itemName = (string) $item['name'];
                        $itemCategory = (string) $item['category_name'];
                        $itemPrice = (float) $item['price'];
                        $itemImage = trim((string) ($item['image_url'] ?? ''));
                        $itemAvailable = (int) $item['is_available'] === 1;
                        ?>
                        <tr class="border-t border-slate-200">
                            <td class="px-4 py-3">
                                <?php if ($itemImage !== ''): ?>
                                    <img
                                        src="<?php echo htmlspecialchars($itemImage, ENT_QUOTES, 'UTF-8'); ?>"
                                        alt="<?php echo htmlspecialchars($itemName, ENT_QUOTES, 'UTF-8'); ?>"
                                        class="w-14 h-14 rounded-lg object-cover border border-slate-200"
                                    >
                                <?php else: ?>
                                    <div class="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] text-slate-500">
                                        No image
                                    </div>
                                <?php endif; ?>
                            </td>

                            <td class="px-4 py-3">
                                <div class="font-medium text-slate-800"><?php echo htmlspecialchars($itemName, ENT_QUOTES, 'UTF-8'); ?></div>
                                <?php if ($itemAvailable): ?>
                                    <span class="inline-flex mt-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-semibold">San sang</span>
                                <?php else: ?>
                                    <span class="inline-flex mt-1 rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-xs font-semibold">Tam dung</span>
                                <?php endif; ?>
                            </td>

                            <td class="px-4 py-3 text-slate-700"><?php echo htmlspecialchars($itemCategory, ENT_QUOTES, 'UTF-8'); ?></td>

                            <td class="px-4 py-3 text-right font-semibold text-slate-800 whitespace-nowrap">
                                <?php echo number_format($itemPrice, 0, ',', '.'); ?> VND
                            </td>

                            <td class="px-4 py-3 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <a
                                        href="admin_menu.php?edit=<?php echo urlencode($itemId); ?>"
                                        class="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                                    >
                                        Chinh sua
                                    </a>
                                    <a
                                        href="admin_menu.php?action=delete&id=<?php echo urlencode($itemId); ?>"
                                        class="inline-flex items-center rounded-md bg-red-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-red-700 transition-colors"
                                        onclick="return confirm('Ban co chac muon xoa mon nay khong?');"
                                    >
                                        Xoa
                                    </a>
                                </div>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</section>

<div id="dishModal" class="fixed inset-0 z-50 <?php echo $showForm ? '' : 'hidden'; ?>">
    <div id="dishModalBackdrop" class="absolute inset-0 bg-slate-900/45"></div>

    <div class="relative z-10 min-h-full flex items-center justify-center p-4">
        <section class="w-full max-w-2xl rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden">
            <header class="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 class="text-lg font-semibold text-slate-900">
                    <?php echo $isEditMode ? 'Chinh sua mon an' : 'Them mon an moi'; ?>
                </h2>
                <button
                    type="button"
                    data-close-dish-modal="true"
                    class="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    aria-label="Dong modal"
                >
                    x
                </button>
            </header>

            <div class="p-5 md:p-6">
                <?php if (!empty($formErrors)): ?>
                    <div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
                        <p class="font-semibold mb-2">Vui long kiem tra lai:</p>
                        <ul class="list-disc pl-5 space-y-1 text-sm">
                            <?php foreach ($formErrors as $errorItem): ?>
                                <li><?php echo htmlspecialchars($errorItem, ENT_QUOTES, 'UTF-8'); ?></li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                <?php endif; ?>

                <form method="POST" action="admin_menu.php" enctype="multipart/form-data" class="grid grid-cols-1 md:grid-cols-2 gap-4" autocomplete="off">
                    <input type="hidden" name="form_action" value="<?php echo $isEditMode ? 'update' : 'create'; ?>">
                    <input type="hidden" name="id" value="<?php echo htmlspecialchars($formValues['id'], ENT_QUOTES, 'UTF-8'); ?>">

                    <div class="md:col-span-2">
                        <label for="dish_name" class="block text-sm font-medium text-slate-700 mb-1">Ten mon an</label>
                        <input
                            id="dish_name"
                            name="name"
                            type="text"
                            maxlength="255"
                            value="<?php echo htmlspecialchars($formValues['name'], ENT_QUOTES, 'UTF-8'); ?>"
                            class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-400"
                            required
                        >
                    </div>

                    <div>
                        <label for="dish_category" class="block text-sm font-medium text-slate-700 mb-1">Danh muc</label>
                        <select
                            id="dish_category"
                            name="category_id"
                            class="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-orange-400"
                            required
                        >
                            <option value="">-- Chon danh muc --</option>
                            <?php foreach ($categories as $category): ?>
                                <?php $catId = (string) $category['id']; ?>
                                <option
                                    value="<?php echo htmlspecialchars($catId, ENT_QUOTES, 'UTF-8'); ?>"
                                    <?php echo $formValues['category_id'] === $catId ? 'selected' : ''; ?>
                                >
                                    <?php echo htmlspecialchars((string) $category['name'], ENT_QUOTES, 'UTF-8'); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div>
                        <label for="dish_price" class="block text-sm font-medium text-slate-700 mb-1">Gia (VND)</label>
                        <input
                            id="dish_price"
                            name="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value="<?php echo htmlspecialchars($formValues['price'], ENT_QUOTES, 'UTF-8'); ?>"
                            class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-400"
                            required
                        >
                    </div>

                    <div>
                        <label for="dish_status" class="block text-sm font-medium text-slate-700 mb-1">Tinh trang</label>
                        <select
                            id="dish_status"
                            name="is_available"
                            class="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-orange-400"
                        >
                            <option value="1" <?php echo $formValues['is_available'] === '1' ? 'selected' : ''; ?>>San sang</option>
                            <option value="0" <?php echo $formValues['is_available'] === '0' ? 'selected' : ''; ?>>Tam dung</option>
                        </select>
                    </div>

                    <div>
                        <label for="dish_image" class="block text-sm font-medium text-slate-700 mb-1">Hinh anh (toi da 2MB)</label>
                        <input
                            id="dish_image"
                            name="image"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            class="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
                        >
                    </div>

                    <div class="md:col-span-2">
                        <label for="dish_description" class="block text-sm font-medium text-slate-700 mb-1">Mo ta</label>
                        <textarea
                            id="dish_description"
                            name="description"
                            rows="3"
                            class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-400"
                            placeholder="Nhap mo ta ngan gon cho mon an"
                        ><?php echo htmlspecialchars($formValues['description'], ENT_QUOTES, 'UTF-8'); ?></textarea>
                    </div>

                    <?php if ($formValues['image_url'] !== ''): ?>
                        <div class="md:col-span-2">
                            <p class="text-sm text-slate-600 mb-2">Hinh hien tai:</p>
                            <img
                                src="<?php echo htmlspecialchars($formValues['image_url'], ENT_QUOTES, 'UTF-8'); ?>"
                                alt="Current dish image"
                                class="w-24 h-24 rounded-lg object-cover border border-slate-200"
                            >
                        </div>
                    <?php endif; ?>

                    <div class="md:col-span-2 flex items-center justify-end gap-2 pt-2">
                        <button
                            type="button"
                            data-close-dish-modal="true"
                            class="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                            Huy
                        </button>

                        <button
                            type="submit"
                            class="inline-flex items-center rounded-lg bg-orange-500 text-white px-4 py-2 font-semibold hover:bg-orange-600 transition-colors"
                        >
                            <?php echo $isEditMode ? 'Luu thay doi' : 'Them mon'; ?>
                        </button>
                    </div>
                </form>
            </div>
        </section>
    </div>
</div>

<script>
(function () {
    const modal = document.getElementById('dishModal');
    const openBtn = document.getElementById('openDishModalBtn');
    const closeButtons = document.querySelectorAll('[data-close-dish-modal="true"]');
    const backdrop = document.getElementById('dishModalBackdrop');
    const shouldOpenOnLoad = <?php echo $showForm ? 'true' : 'false'; ?>;
    const shouldRedirectOnClose = <?php echo $isEditFromQuery ? 'true' : 'false'; ?>;

    if (!modal) {
        return;
    }

    const openModal = function () {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = function () {
        if (shouldRedirectOnClose) {
            window.location.href = 'admin_menu.php';
            return;
        }

        modal.classList.add('hidden');
        document.body.style.overflow = '';
    };

    if (openBtn) {
        openBtn.addEventListener('click', openModal);
    }

    closeButtons.forEach(function (button) {
        button.addEventListener('click', closeModal);
    });

    if (backdrop) {
        backdrop.addEventListener('click', closeModal);
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    if (shouldOpenOnLoad) {
        openModal();
    }
})();
</script>

<?php require __DIR__ . '/includes/footer.php'; ?>
