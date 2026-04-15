<?php

namespace App\Controllers;

class HomeController extends BaseController
{
    public function index()
    {
        $config = require APP_PATH . '/Config/app.php';

        $this->render('home/index', array(
            'title' => $config['name'],
            'message' => 'PHP MVC scaffold is ready on Vertrigo.',
            'environment' => $config['env'],
        ));
    }
}
