<?php

namespace App\Core;

class Request
{
    public function method()
    {
        return isset($_SERVER['REQUEST_METHOD']) ? strtoupper($_SERVER['REQUEST_METHOD']) : 'GET';
    }

    public function uri()
    {
        $requestUri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/';
        $path = parse_url($requestUri, PHP_URL_PATH);

        if ($path === false || $path === null || $path === '') {
            return '/';
        }

        return $path;
    }

    public function all()
    {
        return $_REQUEST;
    }

    public function input($key, $default = null)
    {
        return isset($_REQUEST[$key]) ? $_REQUEST[$key] : $default;
    }

    public function only($keys)
    {
        $results = array();

        foreach ($keys as $key) {
            if (isset($_REQUEST[$key])) {
                $results[$key] = $_REQUEST[$key];
            }
        }

        return $results;
    }
}
