<?php
$script_file_name = '../frontend/js/script.js';
$script_last_modified = filemtime($script_file_name);
?>

<!DOCTYPE html>
<html lang="pl">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <base href="/p/" />
        <title>Testina</title>

        <!-- Arkusze stylów CSS -->
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:400&display=fallback" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400i,500,700&display=fallback" />
        <link rel="stylesheet" href="css/font-awesome.min.css" />
        <link rel="stylesheet" href="css/style.css" />

        <!-- Skrypty JavaScript -->
        <script src="js/script?<?php echo($script_last_modified); ?>" type="module"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.3/Chart.min.js"></script>

        <!-- Ikona strony -->
        <meta name="theme-color" content="#ffffff">
        <link rel="icon" href="images/logo/testina.svg">
        <link rel="apple-touch-icon" href="images/logo/testina-180.png">
        <link rel="manifest" href="json/manifest.json">

        <!-- Stylizacja ekranu ładowania -->
        <style>
            div.loading-wrapper {
                position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:20;
                background:var(--background-empty-color);
                display: grid; grid-template-columns:1fr auto 1fr; grid-template-rows:1fr auto auto 1.5fr;
            }

            div.loading-wrapper img,
            div.loading-wrapper svg {
                grid-column:2; grid-row:2; width:160px; animation-name:logo-blink;
                animation-duration:4s; animation-iteration-count:infinite;
            }
            div.loading-wrapper .loading-text {
                grid-column:2; grid-row:3; margin-top:20px; color:var(--text-secondary-color);
                text-align:center;
            }

            @keyframes logo-blink {
                40% {opacity:1;}
                50% {opacity:0.7;}
                60% {opacity:1;}
            }
        </style>
    </head>
    <body>
        <!-- Panel nawigacji -->
        <nav class="main-nav" id="main-nav"></nav>
        <div class="nav-backdrop"></div>

        <!-- Nagłówek dla urządzeń mobilnych -->
        <div class="mobile-header" id="mobile-header"></div>

        <!-- Główna zawartość strony -->
        <main id="content-container"></main>

        <!-- Wskaźnik ładowania -->
        <div id="loading-wrapper" class="loading-wrapper">
            <!-- Logo Testiny -->
            <svg width="160" height="160" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
                <style type="text/css" >
                    <![CDATA[

                    path {
                        stroke:#fff;
                        stroke-width: 16;
                        stroke-linecap: round;
                        fill: none;
                    }

                    .logo-backplate {
                        fill:url(#gradient-light);
                        stroke:none;
                    }

                    @media (prefers-color-scheme: dark){
                        .logo-backplate {fill:url(#gradient-dark);}
                    }

                    html.dark .logo-backplate {fill:url(#gradient-dark);}
                    html.light .logo-backplate {fill:url(#gradient-light);}

                    ]]>
                </style>

                <defs>
                    <linearGradient id="gradient-light" x1="10%" y1="10%" x2="90%" y2="90%" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#00acc1" offset="0%"/>
                        <stop stop-color="#1e88e5" offset="50%"/>
                        <stop stop-color="#5e35b1" offset="100%" />
                    </linearGradient>
                    <linearGradient id="gradient-dark" x1="10%" y1="10%" x2="90%" y2="90%" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#26c6da" offset="0%"/>
                        <stop stop-color="#42a5f5" offset="50%"/>
                        <stop stop-color="#7e57c2" offset="100%" />
                    </linearGradient>
                </defs>

                <rect x="0" y="0" rx="20" width="160" height="160" class="logo-backplate" />

                <!-- Pozioma kreska litery T -->
                <path d="
                    M 120 40
                    h -70
                    a 15 15 0 0 0 -15 15
                    " />

                <!-- Pionowa kreska litery T -->
                <path d="
                    M 80 40
                    v 75
                    a 15 15 0 0 0 15 15
                    " />
            </svg>
            <span class="loading-text">Ładowanie...</span>
        </div>
    </body>
</html>