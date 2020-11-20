<?php
use Database\DatabaseManager;
use Database\MySQL;

use Auth\ExternalLogin\TokenManager;

use Session\SessionManager;

require_once('autoincluder.php');

// Inicjalizacja dostawcy bazy danych oraz sesji
$db = new MySQL(CRED_DATABASE_HOST, CRED_DATABASE_USER, CRED_DATABASE_PASSWORD, CRED_DATABASE_BASE);
$db->Connect();
DatabaseManager::SetProvider($db);

$kp = new Session\Key\CookieKeyProvider(CONFIG_SESSION_COOKIE);
SessionManager::SetKeyProvider($kp);
SessionManager::Start(CONFIG_SESSION_DURATION);

// Krok 1. Odbiór danych z serwera Office
// Sprawdź, czy wymagane parametry istnieją
if(!isset($_GET['code']) || !isset($_GET['state'])){
    echo('Wystąpił problem z logowaniem. Odpowiedź serwera Office nie zawiera wszystkich wymaganych parametrów.');
    exit;
}

// Pobierz parametry
$code = $_GET['code'];
$state = $_GET['state'];

// Krok 2. Pobranie tokenów
try{
    $response = TokenManager::ExchangeAuthorizationCodeIntoTokens($code);
    TokenManager::RegisterAccessToken($response->AccessToken, $response->ExpiresIn);
    TokenManager::RegisterRefreshToken($response->RefreshToken);

    // Krok 3. Pobranie informacji o aktualnie zalogowanym użytkowniku
    $user = new Auth\ExternalLogin\OfficeUser();
    Auth\AuthManager::RegisterUserFactory(new Entities\UserFactory());
    Auth\AuthManager::LogInExternalUser($user->GetId());
}catch(Exception $e){
    echo('Wystąpił błąd. '.$e->getMessage());
}

// Krok 4. Przekierowanie do strony głównej (dokładniej - do strony, którą chciał wyświetlić użytkownik)
try{
    require('index.php');
}catch(Throwable $t){
    echo('<a href="'.CONFIG_BASE_DIR.'">Przejdź do strony głównej</a>');
}
?>