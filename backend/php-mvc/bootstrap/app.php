<?php

define('BASE_PATH', dirname(__DIR__));
define('APP_PATH', BASE_PATH . '/app');
define('VIEW_PATH', APP_PATH . '/Views');
define('STORAGE_PATH', BASE_PATH . '/storage');

require APP_PATH . '/Helpers/functions.php';

loadEnv(BASE_PATH . '/.env');

$timezone = env('APP_TIMEZONE', 'UTC');
if (!empty($timezone)) {
    date_default_timezone_set($timezone);
}

spl_autoload_register(function ($class) {
    $prefix = 'App\\';

    if (strpos($class, $prefix) !== 0) {
        return;
    }

    $relativeClass = substr($class, strlen($prefix));
    $file = APP_PATH . '/' . str_replace('\\', '/', $relativeClass) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});
