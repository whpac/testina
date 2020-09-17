<?php
use Database\DatabaseManager;
use Database\MySQL;

use ExternalLogin\TokenManager;

use Session\SessionManager;

require_once('autoincluder.php');

// Inicjalizacja dostawcy bazy danych oraz sesji
$db = new MySQL(CRED_DATABASE_HOST, CRED_DATABASE_USER, CRED_DATABASE_PASSWORD, CRED_DATABASE_BASE);
$db->Connect();
DatabaseManager::SetProvider($db);

$kp = new Session\Key\CookieKeyProvider('SESSION');
SessionManager::SetKeyProvider($kp);
SessionManager::Start(36000);

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
$response = TokenManager::ExchangeAuthorizationCodeIntoTokens($code);
TokenManager::RegisterAccessToken($response->AccessToken, $response->ExpiresIn);
TokenManager::RegisterRefreshToken($response->RefreshToken);

// Krok 3. Pobranie informacji o aktualnie zalogowanym użytkowniku
// Krok 4. Przekierowanie do strony głównej (w zamierzeniu - do strony, którą chciał wyświetlić użytkownik)

echo('<pre>');
echo("Stan: $state\n");
echo("Wygasa za: $response->ExpiresIn\n");
echo('</pre>');
?>