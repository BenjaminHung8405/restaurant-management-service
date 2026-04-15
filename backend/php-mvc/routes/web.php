<?php

use App\Controllers\HomeController;
use App\Core\Router;

return function (Router $router) {
    $router->get('/', array(HomeController::class, 'index'));
};
