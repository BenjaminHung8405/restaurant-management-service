<?php
$pageTitle = isset($title) ? $title : 'PHP MVC App';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8'); ?></title>
    <style>
        :root {
            --bg: #f5f7fb;
            --surface: #ffffff;
            --text: #1f2937;
            --muted: #6b7280;
            --line: #e5e7eb;
            --primary: #0f766e;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            background: var(--bg);
            color: var(--text);
            font-family: Tahoma, Arial, sans-serif;
            line-height: 1.55;
        }

        .container {
            width: min(920px, 92vw);
            margin: 0 auto;
        }

        header {
            border-bottom: 1px solid var(--line);
            background: var(--surface);
        }

        header .container {
            padding: 18px 0;
        }

        main .container {
            padding: 28px 0;
        }

        .card {
            background: var(--surface);
            border: 1px solid var(--line);
            border-radius: 12px;
            padding: 20px;
        }

        .muted {
            color: var(--muted);
        }

        .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 999px;
            background: #e6fffa;
            color: var(--primary);
            border: 1px solid #99f6e4;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.2px;
        }

        footer {
            border-top: 1px solid var(--line);
            margin-top: 32px;
            background: var(--surface);
        }

        footer .container {
            padding: 14px 0;
            color: var(--muted);
            font-size: 13px;
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <strong><?php echo htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8'); ?></strong>
        </div>
    </header>

    <main>
        <div class="container">
            <?php echo $content; ?>
        </div>
    </main>

    <footer>
        <div class="container">
            MVC scaffold for PHP on Vertrigo.
        </div>
    </footer>
</body>
</html>
