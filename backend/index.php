<?php
// Measure page render time
$time_start = microtime(true);

use \UEngine\Modules\Core\Properties;
use \UEngine\Modules\Loader;
use \UEngine\Modules\Pages\PageManager;
use \UEngine\Modules\Pages\UrlHandler;
use \UEngine\Modules\Pages\Handlers\RegistryHandler;
use \UEngine\Modules\Pages\Navbar;
use \UEngine\Modules\Pages\Navbar\NavbarStorage;

use Auth\AuthHandler;
use Auth\AccessControl\AuthManager;

use Database\DatabaseManager;
use Database\MySQL;

use Session\SessionManager;

// Uses UE.dev not to duplicate files
require('../../ue/uengine/uengine.php');
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

// @deprecated
$db = new UEngine\Modules\Database\MySQL('localhost', 'user', 'passwd', 'p');
$db->Connect();
UEngine\Modules\Core\Database\DatabaseManager::SetProvider($db);

$kp = new UEngine\Modules\Session\Key\CookieKeyProvider('SESSION');
UEngine\Modules\Session\SessionManager::SetKeyProvider($kp);
UEngine\Modules\Session\SessionManager::Start(36000);

// Inicjalizacja dostawcy bazy danych oraz sesji
$db = new MySQL('localhost', 'user', 'passwd', 'p');
$db->Connect();
DatabaseManager::SetProvider($db);

$kp = new Session\Key\CookieKeyProvider('SESSION');
SessionManager::SetKeyProvider($kp);
SessionManager::Start(36000);

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
PageManager::AddStylesheet('css/font-awesome.min.css');
PageManager::AddStylesheet('css/style.css');
PageManager::AddScript('js/script', true);
PageManager::AddHeadTag('<base href="/p/" />');
PageManager::SetRenderer(new \Layout\StandardRenderer());

// Initializing a navbar
NavbarStorage::AddItem(new Navbar\NavbarHeader(AuthManager::GetCurrentUser()->GetFullName()));
NavbarStorage::AddItem('Strona główna', ['href' => 'home', 'icon' => 'fa-home']);
NavbarStorage::AddItem('Testy', ['href' => 'testy/lista', 'icon' => 'fa-pencil-square-o']);
NavbarStorage::AddItem('Biblioteka testów', ['href' => 'testy/biblioteka', 'icon' => 'fa-files-o']);
NavbarStorage::AddItem('Ankiety', ['href' => 'ankiety', 'icon' => 'fa-bar-chart']);
NavbarStorage::AddItem(new Navbar\NavbarSeparator());
NavbarStorage::AddItem('Konto', ['href' => 'konto', 'icon' => 'fa-user-o']);
NavbarStorage::AddItem('Wyloguj', ['href' => '?wyloguj', 'icon' => 'fa-sign-out', 'css' => 'vulnerable']);
NavbarStorage::AddItem(new Navbar\NavbarSeparator());
NavbarStorage::AddItem('Pomoc', ['href' => 'pomoc', 'icon' => 'fa-question-circle']);

// The handled site is being included and buffered here
PageManager::BeginFetchingContent();

if(!AuthManager::IsAuthorized()){
    include('pages/login.php');
}

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