<?php
namespace Layout;

use \UEngine\Modules\Pages\PageManager;

define('DEFAULT_TITLE', 'Lorem Ipsum');

function Prepend(){
    echo('<!DOCTYPE html>');
    echo('<html lang="pl">');
    echo('<head>');
    echo('<meta charset="utf-8" />');
    echo('<meta name="viewport" content="width=device-width, initial-scale=1" />');
    echo('<base href="/p/" />');
    echo('<title>'.DEFAULT_TITLE.'</title>');

    // Arkusze stylów CSS
    echo('<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:400&display=fallback" />');
    echo('<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400i,500,700&display=fallback" />');
    echo('<link rel="stylesheet" href="css/font-awesome.min.css" />');
    echo('<link rel="stylesheet" href="css/style.css" />');

    // Skrypty JS
    echo('<script src="js/script" type="module"></script>');

    // Ikona
    echo('<link rel="shortcut icon" href="favicon.ico" />');

    echo('</head>');

    $get_path = '';
    if(isset($_GET['_path'])) $get_path = $_GET['_path'];
    echo('<body class="preload" data-url="'.$get_path.'">');

    echo('<nav class="main-nav" id="main-nav">');
    echo('</nav>');
    echo('<div class="nav-backdrop"></div>');
    echo('<aside class="mobile-header">');
    echo('<a class="nav-toggle nav-icon"><i class="icon fa fa-fw fa-bars"></i></a>');
    echo('<h1 id="mobile-header-title">'.DEFAULT_TITLE.'</h1>');
    echo('</aside>');
    echo('<main id="content-container">');
}

function Append(){
    echo('</main>');
    echo('<aside id="loading-wrapper" class="loading-wrapper">Loading</aside>');
    echo('</body>');
    echo('</html>');
    //if(isset($render_time)) echo('<!-- Render time: '.$render_time.' -->');
}
?>