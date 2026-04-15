<?php
declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require __DIR__ . '/db.php';

$identity = '';
$password = '';
$errorMessage = '';

if (isset($_SESSION['auth_error'])) {
    $errorMessage = trim((string) $_SESSION['auth_error']);
    unset($_SESSION['auth_error']);
}

if ($errorMessage === '' && isset($_GET['error'])) {
    $errorMessage = trim((string) $_GET['error']);
}

$redirectByRole = static function (string $role): string {
    $normalizedRole = strtolower(trim($role));

    if ($normalizedRole === 'admin' || $normalizedRole === 'staff') {
        return 'admin_orders.php';
    }

    return 'index.php';
};

if (isset($_SESSION['user']) && is_array($_SESSION['user']) && $errorMessage === '') {
    $currentRole = isset($_SESSION['user']['role']) ? (string) $_SESSION['user']['role'] : 'customer';
    header('Location: ' . $redirectByRole($currentRole));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $identity = isset($_POST['identity']) ? trim((string) $_POST['identity']) : '';
    $password = isset($_POST['password']) ? (string) $_POST['password'] : '';

    if ($identity === '' || $password === '') {
        $errorMessage = 'Vui long nhap day du thong tin dang nhap.';
    } else {
        try {
            $sql = '
                SELECT id, email, full_name, role, password_hash
                FROM users
                WHERE email = :identity OR full_name = :identity
                LIMIT 1
            ';

            $stmt = $pdo->prepare($sql);
            $stmt->execute(['identity' => $identity]);
            $user = $stmt->fetch();

            if (!$user) {
                $errorMessage = 'Thong tin dang nhap khong chinh xac.';
            } else {
                $storedHash = (string) ($user['password_hash'] ?? '');
                $isPasswordValid = false;

                if ($storedHash !== '') {
                    $isPasswordValid = password_verify($password, $storedHash);

                    if (!$isPasswordValid) {
                        // Temporary fallback for legacy plain-text test data.
                        $isPasswordValid = hash_equals($storedHash, $password);
                    }
                }

                if (!$isPasswordValid) {
                    $errorMessage = 'Thong tin dang nhap khong chinh xac.';
                } else {
                    session_regenerate_id(true);

                    $displayName = trim((string) ($user['full_name'] ?? ''));
                    if ($displayName === '') {
                        $displayName = (string) $user['email'];
                    }

                    $_SESSION['user'] = [
                        'user_id' => (string) $user['id'],
                        'username' => $displayName,
                        'role' => (string) $user['role'],
                        'email' => (string) $user['email'],
                    ];

                    header('Location: ' . $redirectByRole((string) $user['role']));
                    exit;
                }
            }
        } catch (PDOException $exception) {
            error_log('login.php database error: ' . $exception->getMessage());
            $errorMessage = 'He thong dang ban. Vui long thu lai sau.';
        }
    }
}

$pageTitle = 'Dang nhap';
require __DIR__ . '/includes/header.php';
?>

<section class="min-h-[70vh] flex items-center justify-center">
    <div class="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">
        <h1 class="text-2xl font-bold text-slate-900 mb-2">Dang nhap</h1>
        <p class="text-slate-600 text-sm mb-6">Nhap tai khoan de tiep tuc dat mon va quan ly don hang.</p>

        <?php if ($errorMessage !== ''): ?>
            <div class="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <?php echo htmlspecialchars($errorMessage, ENT_QUOTES, 'UTF-8'); ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="login.php" class="space-y-4">
            <div>
                <label for="identity" class="block text-sm font-medium text-slate-700 mb-1">Email hoac username</label>
                <input
                    id="identity"
                    name="identity"
                    type="text"
                    value="<?php echo htmlspecialchars($identity, ENT_QUOTES, 'UTF-8'); ?>"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="email@example.com"
                    required
                >
            </div>

            <div>
                <label for="password" class="block text-sm font-medium text-slate-700 mb-1">Mat khau</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="********"
                    required
                >
            </div>

            <button
                type="submit"
                class="w-full rounded-lg bg-teal-600 text-white py-2.5 font-semibold hover:bg-teal-700 transition-colors"
            >
                Dang nhap
            </button>
        </form>

        <p class="mt-4 text-xs text-slate-500">
            Ghi chu: He thong uu tien dang nhap bang email; username hien tai map theo full_name.
        </p>
    </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>
