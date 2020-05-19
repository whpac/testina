<?php
// Measure page render time
$time_start = microtime(true);

/*declare(ticks = 1);

function onTick(){
    echo('X');
}

register_tick_function('onTick');*/

use \UEngine\Modules\Auth\AuthHandler;
use \UEngine\Modules\Auth\AccessControl\AuthManager;
use \UEngine\Modules\Core\Properties;
use \UEngine\Modules\Loader;
use \UEngine\Modules\Pages\PageManager;
use \UEngine\Modules\Pages\UrlHandler;
use \UEngine\Modules\Pages\Handlers\RegistryHandler;
use \UEngine\Modules\Pages\Navbar;
use \UEngine\Modules\Pages\Navbar\NavbarStorage;

// Uses UE.dev not to duplicate files
require('../ue/uengine/uengine.php');
require('autoincluder.php');

UEngine\SetLanguageList(['pl']);
UEngine\Load();

// Loading modules
Loader::LoadModule('database');
Loader::LoadModule('session');
Loader::LoadModule('pages');
Loader::LoadModule('auth');

// Passing some tables' names
Properties::Set('core.tables.exceptions', 'exceptions');
Properties::Set('session.tables.sessions', 'sessions');
Properties::Set('session.tables.session_data', 'session_data');

// Initializing MySQL and session
$db = new UEngine\Modules\Database\MySQL('localhost', 'rr', 'rada', 'p');
$db->Connect();
UEngine\Modules\Core\Database\DatabaseManager::SetProvider($db);

$kp = new UEngine\Modules\Session\Key\CookieKeyProvider('SESSION');
UEngine\Modules\Session\SessionManager::SetKeyProvider($kp);
UEngine\Modules\Session\SessionManager::Start(36000);

// Initializing authentication handler
AuthHandler::RegisterHandler('login', new Handling\LoginHandler());
AuthHandler::RegisterLogoutHandler('wyloguj');

// Set UserFactory
AuthManager::RegisterUserFactory(new Entities\UserFactory());

// Handle potential login attempt
AuthHandler::HandleAuthIfNecessary();
AuthManager::RestoreCurrentUser();

// Initializing the page manager
PageManager::SetTitleFormat('%sLorem Ipsum');
PageManager::SetTitleParser(['\UEngine\Modules\Pages\TitleParsers', 'HyphenAfter']);
PageManager::AddStylesheet('https://fonts.googleapis.com/css?family=Roboto:400&display=fallback');
PageManager::AddStylesheet('https://fonts.googleapis.com/css?family=Roboto:300,400i,500,700&display=fallback');
PageManager::AddStylesheet('font-awesome.min.css');
PageManager::AddStylesheet('style.css');
PageManager::AddScript('jquery-3.4.1.min.js');
PageManager::AddScript('script.js');
PageManager::AddScript('tests.js');
PageManager::AddScript('dialogs.js');
PageManager::AddScript('library.js');
PageManager::AddScript('toasts.js');
PageManager::AddScript('testeditor.js');
PageManager::AddHeadTag('<base href="/p/" />');
PageManager::SetRenderer(new \Layout\StandardRenderer());

UrlHandler::RegisterErrorDocument(404, __DIR__.'/pages/404.php');

// Initializing an URL handler
$handler = new RegistryHandler(['root_path' => 'pages/']);
$handler->SetOption('default_mode', RegistryHandler::MATCH_STARTS_WITH);

$api_handler = new RegistryHandler(['root_path' => 'api/']);
$api_handler->SetOption('default_mode', RegistryHandler::MATCH_STARTS_WITH);

$url = [];
$url['home'] = 'main.php';
$url['informacje'] = 'about.php';
$url['konto'] = 'account.php';
$url['login'] = 'main.php';
$url['pomoc'] = 'help.php';
$url['testy/biblioteka'] = 'tests/library.php';
$url['testy/edytuj'] = 'tests/edit.php';
$url['testy/lista'] = 'tests/list.php';
$url['testy/rozwiąż'] = 'tests/solve.php';
$url['testy/szczegóły'] = 'tests/details.php';
$url['testy/wynik'] = 'tests/result.php';

$url['_dev'] = '_dev.php';

$api = [];
$api['get_test'] = 'get_test.php';
$api['save_question'] = 'save_question.php';
$api['save_test_results'] = 'save_test_results.php';

Properties::Set('pages.handlers.main_page', 'home');
if(AuthManager::IsAuthorized()){
    foreach($url as $u => $p) $handler->AddPage($u, $p);
    foreach($api as $u => $p) $api_handler->AddPage('api/'.$u, $p);
}else{
    Properties::Set('pages.handlers.main_page', 'login');
    PageManager::SetRenderer(new \Layout\LoginRenderer());
    foreach($url as $u => $p) $handler->AddPage($u, 'login.php');
}

UrlHandler::AddHandler($handler);
UrlHandler::AddHandler($api_handler);

// Initializing a resource handler (stylesheets, scripts, fonts etc.)
$res_handler = new Handling\ResourceHandler(['css', 'js', 'eot', 'svg', 'ttf', 'woff', 'woff2', 'json'], 'assets/');
UrlHandler::AddHandler($res_handler);

// Initializing a navbar
NavbarStorage::AddItem(new Navbar\NavbarHeader(AuthManager::GetCurrentUser()->GetFullName()));
NavbarStorage::AddItem('Strona główna', ['href' => 'home', 'icon' => 'fa-home']);
NavbarStorage::AddItem('Testy', ['href' => 'testy/lista', 'icon' => 'fa-pencil-square-o']);
NavbarStorage::AddItem('Biblioteka testów', ['href' => 'testy/biblioteka', 'icon' => 'fa-files-o']);
NavbarStorage::AddItem(new Navbar\NavbarSeparator());
NavbarStorage::AddItem('Konto', ['href' => 'konto', 'icon' => 'fa-user-o']);
NavbarStorage::AddItem('Wyloguj', ['href' => '?wyloguj', 'icon' => 'fa-sign-out', 'css' => 'vulnerable']);

NavbarStorage::AddItem(new Navbar\NavbarSeparator());
NavbarStorage::AddItem('Strona testowa', ['href' => '_dev', 'icon' => 'fa-code']);
NavbarStorage::AddItem('Do zrobienia', ['href' => 'https://github.com/whpac/testina/issues', 'icon' => 'fa-code']);

// The handled site is being included and buffered here
PageManager::BeginFetchingContent();
UrlHandler::Handle();
PageManager::EndFetchingContent();

// End masuring time
$time_end = microtime(true);
$render_time = (($time_end-$time_start)*1000).'ms';

// Generating the whole website and flushing it
PageManager::Render(['lang' => 'pl', 'render_time' => $render_time, 'cache' => 'no']);

// Function responsible for matching singular, double and plural
function n($n, $f1, $f2, $f5){
    if($n == 1) return $f1;
    
    $n1 = $n % 10;
    $n2 = (($n % 100) - $n1) / 10;

    if(($n1 == 2 || $n1 == 3 || $n1 == 4) && $n2 != 1) return $f2;

    return $f5;
}
?>