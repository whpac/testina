<?php
use Api\Context;
use Api\Exceptions;
use Api\Formats;
use Api\Resources;

use Auth\AuthManager;

use Database\DatabaseManager;
use Database\MySQL;

use Log\Logger;
use Log\LogChannels;

use Session\SessionManager;

require('autoincluder.php');

// Inicjalizacja dostawcy bazy danych oraz sesji
$db = new MySQL(CRED_DATABASE_HOST, CRED_DATABASE_USER, CRED_DATABASE_PASSWORD, CRED_DATABASE_BASE);
$db->Connect();
DatabaseManager::SetProvider($db);

$kp = new Session\Key\CookieKeyProvider('SESSION');
SessionManager::SetKeyProvider($kp);
SessionManager::Start(36000);

// Inicjalizacja menedżera kont
AuthManager::RegisterUserFactory(new Auth\ExternalLogin\OfficeUserFactory());
AuthManager::RestoreCurrentUser();

$SUPPORTED_METHODS = ['GET', 'POST', 'PUT', 'DELETE'];

$method = '';
$target = '';
$formatter = null;

try{
    // Odczytaj metodę żądania
    $method = ReadMethod($SUPPORTED_METHODS);

    // Odczytaj zasób docelowy, parametr głębokości i filtry z adresu URL
    $target = ReadTarget();
    $depth = ReadDepth(3, 20);
    $filters = ReadFilters();

    // Przygotuj kontekst zabezpieczeń
    $current_user = AuthManager::GetCurrentUser();
    $context = new Context($current_user, $method);

    // Przygotuj formater wyjścia na podstawie nagłówków HTTP
    $formatter = GetFormatter();
    $formatter->SetContext($context);

    // Wyślij nagłówki odpowiedzi, w tym typ zawartości
    SendHeaders($formatter->GetContentType());

    // Odczytaj żądany zasób i ustaw w nim filtry
    $current_resource = GetResource($target, $context);
    if($current_resource instanceof Api\Resources\Resource) $current_resource->SetFilters($filters);

    switch($method){
        case 'GET':
            // Zserializuj zasób
            $serialized_resource = $formatter->FormatResource($current_resource, $depth);
            echo($serialized_resource);
        break;
        case 'POST':
            // Utwórz nowy zasób
            $result = $current_resource->CreateSubResource(ParseRequestBody());

            if(is_null($result)){
                // Odpowiedz kodem 201 Created
                SetResponseCode(201);
            }else{
                // Zwróć zasób wynikowy
                $serialized_resource = $formatter->FormatResource($result, $depth);
                echo($serialized_resource);
            }
        break;
        case 'PUT':
            // Zaktualizuj zasób
            $current_resource->Update(ParseRequestBody());
            // Odpowiedz kodem 204 No Content
            SetResponseCode(204);
        break;
        case 'DELETE':
            // Usuń zasób
            $current_resource->Delete(ParseRequestBody());
            // Odpowiedz kodem 204 No Content
            SetResponseCode(204);
        break;
    }

}catch(Exceptions\BadRequest $e){
    SetResponseCode(400);
    Logger::Log('Przeprowadzono błędne żądanie: '.$e->getMessage(), LogChannels::GENERAL);

    if(!is_null($formatter)){
        $error_resource = new \Api\Resources\Error($e->getMessage());
        echo($formatter->FormatResource($error_resource));
    }
}catch(Exceptions\AuthorizationRequired $e){
    SetResponseCode(401);
    Logger::Log('Zablokowano niezalogowanemu próbę dostępu do '.$target, LogChannels::ACCESS_FORBIDDEN);

    if(!is_null($formatter)){
        $error_resource = new \Api\Resources\Error('Musisz być zalogowany, by uzyskać dostęp do tego zasobu.');
        echo($formatter->FormatResource($error_resource));
    }
}catch(Exceptions\ResourceInaccessible $e){
    SetResponseCode(403);
    Logger::Log('Zablokowano próbę dostępu z powodu niewystarczających uprawnień do '.$target, LogChannels::ACCESS_FORBIDDEN);

    if(!is_null($formatter)){
        $error_resource = new \Api\Resources\Error('Nie masz wystarczających uprawnień, by uzyskać dostęp do tego zasobu.');
        echo($formatter->FormatResource($error_resource));
    }
}catch(Exceptions\ResourceNotFound $e){
    SetResponseCode(404);
    Logger::Log('Wnioskowano o nieistniejący zasób: '.$target, LogChannels::GENERAL);

    if(!is_null($formatter)){
        $error_resource = new \Api\Resources\Error('Zasób nie istnieje.');
        echo($formatter->FormatResource($error_resource));
    }
}catch(Exceptions\MethodNotAllowed $e){
    SetResponseCode(405);
    Logger::Log('Zablokowano próbę żądania nieznaną metodą: '.$method, LogChannels::VALIDATION_GENERAL);

    if(!is_null($formatter)){
        $error_resource = new \Api\Resources\Error('Metoda żądania jest nieobsługiwana przez zasób.');
        echo($formatter->FormatResource($error_resource));
    }
}catch(Exceptions\NotAcceptable $e){
    SetResponseCode(406);
    Logger::Log('Serwer nie może zwrócić odpowiedzi w formacie oczekiwanym przez klienta: '.$e->GetClientAccept(), LogChannels::VALIDATION_GENERAL);

    if(!is_null($formatter)){
        $error_resource = new \Api\Resources\Error('Serwer nie obsługuje żądanego formatu odpowiedzi.');
        echo($formatter->FormatResource($error_resource));
    }
}catch(Exceptions\NotImplemented $e){
    SetResponseCode(501);
    Logger::Log('Próbowano wywołać niezaimplementowaną procedurę: '.$e->getMessage(), LogChannels::GENERAL);

    if(!is_null($formatter)){
        $error_resource = new \Api\Resources\Error('Nie zaimplementowano tej funkcji.');
        echo($formatter->FormatResource($error_resource));
    }
}catch(\Exception $e){
    SetResponseCode(500);
    Logger::Log('Wystąpił nieznany błąd: '.$e->getMessage(), LogChannels::APPLICATION_ERROR);

    if(!is_null($formatter)){
        $error_resource = new \Api\Resources\Error('Wystąpił nieznany błąd.');
        echo($formatter->FormatResource($error_resource));
    }
}

try{
    // Usuwa przeterminowane tokeny uwierzytelniania
    // Ta funkcja znajduje się tutaj, by być wykonywaną jak najczęściej
    Auth\ExternalLogin\TokenManager::RemoveExpiredTokens();
}catch(\Exception $e){

}


/**
 * Odczytuje metodę żądania
 * @param $supported_methods Wspierane metody
 */
function ReadMethod(array $supported_methods){
    $method = $_SERVER['REQUEST_METHOD'];

    if(!in_array($method, $supported_methods))
        throw new Exceptions\MethodNotAllowed($method);
    
    return $method;
}

/**
 * Odczytuje ścieżkę docelowego zasobu z URL
 */
function ReadTarget(){
    if(isset($_GET['target'])) $target = $_GET['target'];
    else $target = '';

    return $target;
}

/**
 * Odczytuje głębokość przetwarzania z URL
 * @param $default Domyślna głębokość
 * @param $max Maksymalna dozwolona głębokość
 */
function ReadDepth(int $default, int $max){
    if(isset($_GET['depth'])) $depth = $_GET['depth'];
    else $depth = $default;

    if(!is_numeric($depth)) $depth = $default;
    settype($depth, 'int');
    if($depth < 1 || $depth > $max) $depth = $default;

    return $depth;
}

/**
 * Odczytuje filtry z URL i dzieli je po znaku przecinka
 */
function ReadFilters(){
    if(!isset($_GET['filter'])) return [];
    $filter = $_GET['filter'];
    return explode(',', $filter);
}

/**
 * Zwraca formater odpowiedzi, zgodny z oczekiwaniami klienta
 */
function GetFormatter(){
    // Przetwórz nagłówek HTTP Accept
    $formats = ParseQList($_SERVER['HTTP_ACCEPT']);

    // Przeiteruj po obsługiwanych typach MIME
    foreach($formats as $format){
        switch($format[0]){
            case 'application/json': return new Formats\JsonFormatter();
            case 'application/*': return new Formats\JsonFormatter();
            case '*/*': return new Formats\JsonFormatter();
        }
    }

    throw new Exceptions\NotAcceptable($_SERVER['HTTP_ACCEPT']);
}

/**
 * Zwraca zasób o podanej ścieżce
 * @param $target Ścieżka do zasobu
 * @param $context Kontekst zabezpieczeń
 */
function GetResource(string $target, Context $context){
    // Rozpocznij od głównego zasobu
    $current_resource = new Resources\Root();
    $current_resource->SetContext($context);
    
    // Podziel ścieżkę docelową przy znakach '/'
    $target_chain = explode('/', $target);
    foreach($target_chain as $current_resource_name){
        // Pomija dwa ukośniki umieszczone obok siebie
        if(empty($current_resource_name)) continue;
        $current_resource_name = strtolower($current_resource_name);

        // Zasadniczo zasób jest albo pojedynczym obiektem albo tablicą
        if(is_array($current_resource)){
            if(isset($current_resource[$current_resource_name]))
                $current_resource = $current_resource[$current_resource_name];
            else
                throw new Exceptions\ResourceNotFound($current_resource_name);
        }else{
            if($current_resource->KeyExists($current_resource_name))
                $current_resource = $current_resource->$current_resource_name();
            else
                throw new Exceptions\ResourceNotFound($current_resource_name);
        }

        // Dodaj kontekst do zasobu, który nie jest tablicą
        if($current_resource instanceof Resources\Resource) $current_resource->SetContext($context);
    }

    return $current_resource;
}

/**
 * Przetwarza treść żądania, odkodowuje JSON
 */
function ParseRequestBody(){
    $body = file_get_contents('php://input');
    return json_decode($body);
}

/**
 * Ustawia kod odpowiedzi HTTP
 * @param $code Kod odpowedzi
 */
function SetResponseCode(int $code){
    header('X-Response-Code: '.$code, true, $code);
}

/**
 * Wysyła nagłówki odpowiedzi HTTP
 * @param $mime Typ MIME zawartości odpowiedzi
 */
function SendHeaders($mime){
    header('Content-Type: '.$mime);
    header('X-Expires: '.(new DateTime())->add(new \DateInterval('PT30S'))->format('Y-m-d\TH:i:sO'));
}

/**
 * Przetwarza q-listę na tablicę posortowaną po wartości q
 * @param $qlist Q-Lista do przetworzenia
 */
function ParseQList(string $qlist){
    $parsed = [];
    $values = explode(',', $qlist);
    $order = 0;

    // Przeiteruj po każdym wpisie typ/mime;q=0.x
    foreach($values as $value){
        // Podziel na typ MIME i wartość q
        $pair = explode(';q=', $value);
        $mime = trim($pair[0]);

        // Jeżeli wartość q nie jest ustawiona, przyjmij 1
        $q = isset($pair[1]) ? $pair[1] : 1;

        // Jeżeli q nie jest liczbą, ustaw je na 0 - żeby nie zostało zaakceptowane
        if(!is_numeric($q)) $q = 0;
        
        // Zapisz dane do tablicy. Zmienna $order służy do zachowania kolejności
        // elementów o takim samym q.
        $parsed[] = [$mime, $q, $order];
        $order++;
    }

    // Posortuj tablicę po wartości q
    usort($parsed, function($a, $b){
        // Sortuj po wartości q
        if($a[1] > $b[1]) return -1;
        if($a[1] < $b[1]) return 1;

        // Jeśli wartość q jest taka sama, sprawdź kolejność w liście wejściowej
        if($a[2] > $b[2]) return 1;
        if($a[2] < $b[2]) return -1;
        return 0;
    });

    return $parsed;
}
?>