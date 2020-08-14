<?php
use Api\Context;
use Api\Exceptions;
use Api\Formats;
use Api\Resources;

use Database\DatabaseManager;
use Database\MySQL;

use \UEngine\Modules\Auth\AuthHandler;
use \UEngine\Modules\Auth\AccessControl\AuthManager;
use \UEngine\Modules\Core\Properties;
use \UEngine\Modules\Loader;
use \UEngine\Modules\Pages\PageManager;

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

// Initializing MySQL and session
$db = new UEngine\Modules\Database\MySQL('localhost', 'user', 'passwd', 'p');
$db->Connect();
UEngine\Modules\Core\Database\DatabaseManager::SetProvider($db);

// Inicjalizacja dostawcy bazy danych oraz sesji
$db = new MySQL('localhost', 'user', 'passwd', 'p');
$db->Connect();
DatabaseManager::SetProvider($db);

$kp = new UEngine\Modules\Session\Key\CookieKeyProvider('SESSION');
UEngine\Modules\Session\SessionManager::SetKeyProvider($kp);
UEngine\Modules\Session\SessionManager::Start(36000);

// Set UserFactory
AuthManager::RegisterUserFactory(new Entities\UserFactory());

// Handle potential login attempt
AuthHandler::HandleAuthIfNecessary();
AuthManager::RestoreCurrentUser();

// Initializing the page manager
PageManager::SetRenderer(new \Layout\ApiRenderer());

PageManager::BeginFetchingContent();

$SUPPORTED_METHODS = ['GET', 'POST', 'PUT', 'DELETE'];

try{
    // Odczytaj metodę żądania
    $method = ReadMethod($SUPPORTED_METHODS);

    // Odczytaj zasób docelowy, parametr głębokości i filtry z adresu URL
    $target = ReadTarget();
    $depth = ReadDepth(3, 20);
    $filters = ReadFilters();

    // Przygotuj kontekst zabezpieczeń
    $current_user = \UEngine\Modules\Auth\AccessControl\AuthManager::GetCurrentUser();
    $context = new Context($current_user);

    // Przygotuj formater wyjścia na podstawie nagłówków HTTP
    $formatter = GetFormatter();
    $formatter->SetContext($context);

    // Odczytaj żądany zasób i ustaw w nim filtry
    $current_resource = GetResource($target, $context);
    $current_resource->SetFilters($filters);

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
            $current_resource->Delete();
            // Odpowiedz kodem 204 No Content
            SetResponseCode(204);
        break;
    }

}catch(Exceptions\BadRequest $e){
    SetResponseCode(400);
    echo('400');
}catch(Exceptions\AuthorizationRequired $e){
    SetResponseCode(401);
    echo('401');
}catch(Exceptions\ResourceInaccessible $e){
    SetResponseCode(403);
    echo('403');
}catch(Exceptions\ResourceNotFound $e){
    SetResponseCode(404);
    echo('404');
}catch(Exceptions\MethodNotAllowed $e){
    SetResponseCode(405);
    echo('405');
}catch(Exceptions\NotAcceptable $e){
    SetResponseCode(406);
    echo('406');
}catch(Exceptions\NotImplemented $e){
    SetResponseCode(501);
    echo('501');
}catch(\Exception $e){
    SetResponseCode(500);
    echo('500');
    echo('Exception thrown: '.$e->getMessage());
}

PageManager::EndFetchingContent();

// Generating the whole website and flushing it
PageManager::Render(['cache' => 'no']);


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
                throw new \Exception(404);
        }else{
            if($current_resource->KeyExists($current_resource_name))
                $current_resource = $current_resource->$current_resource_name();
            else
                throw new \Exception(404);
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