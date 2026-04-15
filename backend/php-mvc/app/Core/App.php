<?php

namespace App\Core;

class App
{
    protected $router;

    public function __construct()
    {
        $this->router = new Router();

        $routesFile = base_path('routes/web.php');
        if (file_exists($routesFile)) {
            $registerRoutes = require $routesFile;

            if (is_callable($registerRoutes)) {
                $registerRoutes($this->router);
            }
        }
    }

    public function run()
    {
        $requestUri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/';
        $path = parse_url($requestUri, PHP_URL_PATH);

        if ($path === false || $path === null || $path === '') {
            $path = '/';
        }

        $method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';
        $this->router->dispatch($method, $path);
    }

    public function router()
    {
        return $this->router;
    }
}
