<?php

if (!function_exists('base_path')) {
    function base_path($path = '')
    {
        return BASE_PATH . ($path !== '' ? '/' . ltrim($path, '/') : '');
    }
}

if (!function_exists('app_path')) {
    function app_path($path = '')
    {
        return APP_PATH . ($path !== '' ? '/' . ltrim($path, '/') : '');
    }
}

if (!function_exists('view_path')) {
    function view_path($path = '')
    {
        return VIEW_PATH . ($path !== '' ? '/' . ltrim($path, '/') : '');
    }
}

if (!function_exists('env')) {
    function env($key, $default = null)
    {
        if (isset($_ENV[$key])) {
            return $_ENV[$key];
        }

        if (isset($_SERVER[$key])) {
            return $_SERVER[$key];
        }

        $value = getenv($key);
        if ($value !== false) {
            return $value;
        }

        return $default;
    }
}

if (!function_exists('loadEnv')) {
    function loadEnv($envPath)
    {
        if (!file_exists($envPath)) {
            return;
        }

        $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            return;
        }

        foreach ($lines as $line) {
            $line = trim($line);

            if ($line === '' || strpos($line, '#') === 0) {
                continue;
            }

            if (strpos($line, '=') === false) {
                continue;
            }

            list($key, $value) = array_map('trim', explode('=', $line, 2));
            $value = trim($value, "\"'");

            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
            putenv($key . '=' . $value);
        }
    }
}
