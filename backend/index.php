<?php
// Measure page render time
$time_start = microtime(true);

use \UEngine\Modules\Core\Properties;
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
require('layout/standardrenderer.php');

// Passing some tables' names
Properties::Set('core.tables.exceptions', 'exceptions');

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
Layout\Prepend();

if(!AuthManager::IsAuthorized()){
    include('pages/login.php');
}

// End masuring time
$time_end = microtime(true);
$render_time = (($time_end-$time_start)*1000).'ms';

Layout\Append();

// Function responsible for matching singular, double and plural
/*function n($n, $f1, $f2, $f5){
    if($n == 1) return $f1;
    
    $n1 = $n % 10;
    $n2 = (($n % 100) - $n1) / 10;

    if(($n1 == 2 || $n1 == 3 || $n1 == 4) && $n2 != 1) return $f2;

    return $f5;
}*/
?>