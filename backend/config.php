<?php
// Dołącza poświadczenia. Są w osobnym pliku, dla ukrycia przed kontrolą wersji
require_once('credentials.php');

define('CONFIG_USE_HTTPS', false);
define('CONFIG_BASE_DIR', '/p/');
define('CONFIG_AUTHORIZATION_REDIRECT_URL', 'http://localhost/p/office_login');

if(CONFIG_USE_HTTPS){
    define('CONFIG_SESSION_COOKIE', '__Host-SESSION');
}else{
    define('CONFIG_SESSION_COOKIE', 'SESSION');
}
define('CONFIG_SESSION_DURATION', 36000);
?>