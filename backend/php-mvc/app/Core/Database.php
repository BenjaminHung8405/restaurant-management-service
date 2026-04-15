<?php

namespace App\Core;

class Database
{
    protected static $connection;

    public static function connection()
    {
        if (self::$connection instanceof \PDO) {
            return self::$connection;
        }

        $config = require APP_PATH . '/Config/database.php';

        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=%s',
            $config['host'],
            $config['port'],
            $config['database'],
            $config['charset']
        );

        try {
            self::$connection = new \PDO(
                $dsn,
                $config['username'],
                $config['password'],
                array(
                    \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                    \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                )
            );
        } catch (\PDOException $exception) {
            http_response_code(500);
            echo 'Database connection failed. Check your .env settings.';
            exit;
        }

        return self::$connection;
    }
}
