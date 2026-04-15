<?php

namespace App\Controllers;

class BaseController
{
    protected function render($view, $data = array(), $layout = 'layouts/main')
    {
        $viewFile = VIEW_PATH . '/' . str_replace('.', '/', $view) . '.php';

        if (!file_exists($viewFile)) {
            http_response_code(500);
            echo 'View not found: ' . htmlspecialchars($view, ENT_QUOTES, 'UTF-8');
            return;
        }

        extract($data);

        ob_start();
        require $viewFile;
        $content = ob_get_clean();

        $layoutFile = VIEW_PATH . '/' . str_replace('.', '/', $layout) . '.php';

        if (file_exists($layoutFile)) {
            require $layoutFile;
            return;
        }

        echo $content;
    }
}
