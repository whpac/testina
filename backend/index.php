<?php
// Measure page render time
$time_start = microtime(true);

use \UEngine\Modules\Core\Properties;

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

// The handled site is being included and buffered here
Layout\Prepend();

if(!AuthManager::IsAuthorized()){
    include('pages/login.php');
}

// End masuring time
$time_end = microtime(true);
$render_time = (($time_end-$time_start)*1000).'ms';

Layout\Append();
?>