<?php
namespace Api;

$SUPPORTED_METHODS = ['GET'];

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

    // Serialize the resource
    $serialized_resource = $formatter->FormatObject($current_resource, $depth);
    echo($serialized_resource);

}catch(Exceptions\AuthorizationRequired $e){
    echo('401');
}catch(Exceptions\ResourceInaccessible $e){
    echo('403');
}catch(Exceptions\ResourceNotFound $e){
    echo('404');
}catch(Exceptions\MethodNotAllowed $e){
    echo('405');
}catch(\Exception $e){
    echo('500');
    echo('Exception thrown: '.$e->getMessage());
}

function ReadMethod($supported_methods){
    $method = $_SERVER['REQUEST_METHOD'];
    if(!in_array($method, $supported_methods))
        throw new Exceptions\MethodNotAllowed($method);
    
    return $method;
}

function ReadTarget(){
    if(isset($_GET['target'])) $target = $_GET['target'];
    else $target = '';

    return $target;
}

function ReadDepth($default, $max){
    if(isset($_GET['depth'])) $depth = $_GET['depth'];
    else $depth = $default;

    if(!is_numeric($depth)) $depth = $default;
    settype($depth, 'int');
    if($depth < 1 || $depth > $max) $depth = $default;

    return $depth;
}

function GetFormatter(){
    // Parse the HTTP Accept
    return new Formats\JsonFormatter();
}

function GetResource($target){
    // Start from root resource
    $current_resource = new Resources\Root();

    // Split names by '/'
    $target_chain = explode('/', $target);
    foreach($target_chain as $current_resource_name){
        // This is done to skip multiple slashes next to each other
        if(empty($current_resource_name)) continue;

        // Follow the specified resource path
        $current_resource = $current_resource->GetSubResource($current_resource_name);
    }

    return $current_resource;
}
?>