<?php
namespace Api;

$SUPPORTED_METHODS = ['GET', 'POST'];

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
            // Response with 204 No Content
            echo('204');
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