<?php
declare(strict_types=1);

$host = 'localhost';
$dbName = 'restoms_db';
$dbUser = 'root';
$dbPassword = 'vertrigo';
$charset = 'utf8mb4';

$dsn = "mysql:host={$host};dbname={$dbName};charset={$charset}";

$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $dbUser, $dbPassword, $options);
} catch (PDOException $exception) {
    error_log('PDO connection failed: ' . $exception->getMessage());
    http_response_code(500);
    exit('Unable to connect to the database.');
}
