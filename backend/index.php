<?php
// Policz czas ładowania strony
$time_start = microtime(true);

// Określa początkowy tytuł strony
define('DEFAULT_TITLE', 'Lorem Ipsum');
?>

<!DOCTYPE html>
<html lang="pl">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <base href="/p/" />
        <title><?php echo(DEFAULT_TITLE); ?></title>

        <!-- Arkusze stylów CSS -->
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:400&display=fallback" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400i,500,700&display=fallback" />
        <link rel="stylesheet" href="css/font-awesome.min.css" />
        <link rel="stylesheet" href="css/style.css" />

        <!-- Skrypty JavaScript -->
        <script src="js/script" type="module"></script>

        <!-- Ikona strony -->
        <link rel="shortcut icon" href="favicon.ico" />
    </head>
    <body>
        <!-- Panel nawigacji -->
        <nav class="main-nav" id="main-nav"></nav>
        <div class="nav-backdrop"></div>

        <!-- Nagłówek dla urządzeń mobilnych -->
        <aside class="mobile-header">
            <a class="nav-toggle nav-icon"><i class="icon fa fa-fw fa-bars"></i></a>
            <h1 id="mobile-header-title"><?php echo(DEFAULT_TITLE); ?></h1>
        </aside>

        <!-- Główna zawartość strony -->
        <main id="content-container"></main>

        <!-- Wskaźnik ładowania -->
        <aside id="loading-wrapper" class="loading-wrapper">Loading</aside>
    </body>
</html>

<?php
// Skończ mierzenie czasu
$time_end = microtime(true);
$render_time = (($time_end-$time_start)*1000).'ms';
echo('<!-- Czas generowania szablonu: '.$render_time.' -->');
?>