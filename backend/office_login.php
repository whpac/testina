<?php
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
// Przygotuj dane dotyczące żądania
$url = 'https://login.microsoftonline.com/organizations/oauth2/v2.0/token';
$data = [
    'client_id' => '7f546198-c3b7-45d0-a98f-091f54cd94b6',
    'scope' => 'user.read',
    'code' => $code,
    'redirect_uri' => 'http://localhost/p/office_login',
    'grant_type' => 'authorization_code',
    'client_secret' => 'c~.Y.9eqZplNO8S_awi.lQ6kPz9QV2x3me'
];

// Opcje żądania
$options = array(
    'http' => array(
        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
        'method'  => 'POST',
        'content' => http_build_query($data)
    )
);

// Wykonaj żądanie
$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);
if ($result === false) {
    echo('Nie udało się pobrać informacji o logowaniu z serwera Office 365.');
    exit;
}

// Przetwórz odpowiedź - pobierz tokeny i czas wygaśnięcia
$response = json_decode($result);
$access_token = $response->access_token;
$refresh_token = null;
if(isset($response->refresh_token)) $refresh_token = $response->refresh_token;
$expires_in = $response->expires_in;

echo('<pre>');
echo("Stan: $state\n");
echo("Token dostępu: $access_token\n");
echo("Token odświeżania: $refresh_token\n");
echo("Wygasa za: $expires_in\n");
echo('</pre>');
?>