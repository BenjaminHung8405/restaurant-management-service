<?php

namespace App\Core;

class Router
{
    protected $routes = array();

    public function get($path, $handler)
    {
        $this->addRoute('GET', $path, $handler);
    }

    public function post($path, $handler)
    {
        $this->addRoute('POST', $path, $handler);
    }

    public function put($path, $handler)
    {
        $this->addRoute('PUT', $path, $handler);
    }

    public function patch($path, $handler)
    {
        $this->addRoute('PATCH', $path, $handler);
    }

    public function delete($path, $handler)
    {
        $this->addRoute('DELETE', $path, $handler);
    }

    public function dispatch($method, $uri)
    {
        $method = strtoupper($method);
        $uri = $this->normalizePath($uri);

        if (!isset($this->routes[$method])) {
            $this->renderNotFound();
            return;
        }

        foreach ($this->routes[$method] as $route) {
            $params = array();

            if ($this->match($route['path'], $uri, $params)) {
                $this->runHandler($route['handler'], array_values($params));
                return;
            }
        }

        $this->renderNotFound();
    }

    protected function addRoute($method, $path, $handler)
    {
        if (!isset($this->routes[$method])) {
            $this->routes[$method] = array();
        }

        $this->routes[$method][] = array(
            'path' => $this->normalizePath($path),
            'handler' => $handler,
        );
    }

    protected function runHandler($handler, $params)
    {
        if (is_callable($handler)) {
            call_user_func_array($handler, $params);
            return;
        }

        if (is_array($handler) && count($handler) === 2) {
            $controller = $handler[0];
            $action = $handler[1];

            if (is_string($controller) && class_exists($controller)) {
                $instance = new $controller();

                if (method_exists($instance, $action)) {
                    call_user_func_array(array($instance, $action), $params);
                    return;
                }
            }
        }

        http_response_code(500);
        echo 'Route handler is invalid.';
    }

    protected function match($routePath, $uri, &$params)
    {
        if ($routePath === '/' && $uri === '/') {
            return true;
        }

        $routeParts = explode('/', trim($routePath, '/'));
        $uriParts = explode('/', trim($uri, '/'));

        if (count($routeParts) !== count($uriParts)) {
            return false;
        }

        foreach ($routeParts as $index => $part) {
            if (preg_match('/^\{([a-zA-Z0-9_]+)\}$/', $part, $matches)) {
                $params[$matches[1]] = $uriParts[$index];
                continue;
            }

            if ($part !== $uriParts[$index]) {
                return false;
            }
        }

        return true;
    }

    protected function normalizePath($path)
    {
        $path = '/' . trim($path, '/');

        if ($path === '//') {
            return '/';
        }

        return rtrim($path, '/') ?: '/';
    }

    protected function renderNotFound()
    {
        http_response_code(404);

        $viewFile = VIEW_PATH . '/errors/404.php';
        if (file_exists($viewFile)) {
            require $viewFile;
            return;
        }

        echo '404 Not Found';
    }
}
