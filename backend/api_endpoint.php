<?php
use Api\Exceptions;
use Api\Formats;
use Api\Resources;

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
$db = new UEngine\Modules\Database\MySQL('localhost', 'rr', 'rada', 'p');
$db->Connect();
UEngine\Modules\Core\Database\DatabaseManager::SetProvider($db);

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

$SUPPORTED_METHODS = ['GET', 'POST', 'DELETE'];

// This should be extended to support mutable objects
try{
    // Read the method
    $method = ReadMethod($SUPPORTED_METHODS);

    // Read target and depth parameters from URL
    $target = ReadTarget();
    $depth = ReadDepth(3, 20);

    // Get formatter based on the HTTP headers
    $formatter = GetFormatter();

    // Read the requested resource
    $current_resource = GetResource($target);

    switch($method){
        case 'GET':
            // Serialize the resource
            $serialized_resource = $formatter->FormatObject($current_resource, $depth);
            echo($serialized_resource);
        break;
        case 'POST':
            // Create a resource
            $current_resource->CreateSubResource(null, null);
            // Response with 201 Created
            echo('201');
        break;
        case 'PUT':
            // Update a resource
            $current_resource->Update(null, null);
            // Response with 204 No Content
            echo('204');
        break;
        case 'DELETE':
            // Delete a resource
            $current_resource->Delete(null);
            // Response with 204 No Content
            header('X-Response-Code: 204', true, 204);
            echo('204');
        break;
    }

}catch(Exceptions\AuthorizationRequired $e){
    echo('401');
}catch(Exceptions\ResourceInaccessible $e){
    echo('403');
}catch(Exceptions\ResourceNotFound $e){
    echo('404');
}catch(Exceptions\MethodNotAllowed $e){
    echo('405');
}catch(Exceptions\NotAcceptable $e){
    echo('406');
}catch(Exceptions\NotImplemented $e){
    echo('501');
}catch(\Exception $e){
    echo('500');
    echo('Exception thrown: '.$e->getMessage());
}

PageManager::EndFetchingContent();

// Generating the whole website and flushing it
PageManager::Render(['cache' => 'no']);


function ReadMethod(array $supported_methods){
    $method = $_SERVER['REQUEST_METHOD'];

    if(isset($_GET['method'])) $method = strtoupper($_GET['method']); // For debug only

    if(!in_array($method, $supported_methods))
        throw new Exceptions\MethodNotAllowed($method);
    
    return $method;
}

function ReadTarget(){
    if(isset($_GET['target'])) $target = $_GET['target'];
    else $target = '';

    return $target;
}

function ReadDepth(/* int */ $default, /* int */ $max){
    if(isset($_GET['depth'])) $depth = $_GET['depth'];
    else $depth = $default;

    if(!is_numeric($depth)) $depth = $default;
    settype($depth, 'int');
    if($depth < 1 || $depth > $max) $depth = $default;

    return $depth;
}

function GetFormatter(){
    // Parse the HTTP Accept
    $formats = ParseQList($_SERVER['HTTP_ACCEPT']);

    // Iterate over the accepted mime types
    foreach($formats as $format){
        switch($format[0]){
            case 'application/json': return new Formats\JsonFormatter();
            case 'application/*': return new Formats\JsonFormatter();
            case '*/*': return new Formats\JsonFormatter();
        }
    }

    throw new Exceptions\NotAcceptable($_SERVER['HTTP_ACCEPT']);
}

function GetResource(/* string */ $target, /* undefined yet */ $context = null){
    // Start from root resource
    $current_resource = new Resources\Root();

    // Split names by '/'
    $target_chain = explode('/', $target);
    foreach($target_chain as $current_resource_name){
        // This is done to skip multiple slashes next to each other
        if(empty($current_resource_name)) continue;

        // Follow the specified resource path
        $current_resource = $current_resource->GetSubResource($current_resource_name, $context);
    }

    return $current_resource;
}

function ParseQList(/* string */ $qlist){
    $parsed = [];
    $values = explode(',', $qlist);
    $order = 0;

    // Iterate over each mime/type;q=0.x entry
    foreach($values as $value){
        // Split into mime and q
        $pair = explode(';q=', $value);
        $mime = trim($pair[0]);
        $q = isset($pair[1]) ? $pair[1] : 1;

        // If q is not a number, set it to 0 - it shouldn't get accepted
        if(!is_numeric($q)) $q = 0;
        
        // Save the data as an array
        $parsed[] = [$mime, $q, $order];
        $order++;
    }

    usort($parsed, function($a, $b){
        // Order by q-value
        if($a[1] > $b[1]) return -1;
        if($a[1] < $b[1]) return 1;

        // Preserve the relative order if the q-value is the same
        if($a[2] > $b[2]) return 1;
        if($a[2] < $b[2]) return -1;
        return 0;
    });

    return $parsed;
}
?>