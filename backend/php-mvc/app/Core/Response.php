<?php

namespace App\Core;

class Response
{
    public function json($data, $statusCode = 200)
    {
        http_response_code((int) $statusCode);
        header('Content-Type: application/json; charset=utf-8');

        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    }

    public function redirect($url)
    {
        header('Location: ' . $url);
        exit;
    }
}
