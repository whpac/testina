<?php
namespace Api;

$SUPPORTED_METHODS = ['GET'];

// This should be extended to support mutable objects
try{
    // Read the method
    $method = $_SERVER['REQUEST_METHOD'];
    if(!in_array($method, $SUPPORTED_METHODS))
        throw new Exceptions\MethodNotAllowed($method);

    // Read target and depth parameters from URL
    $target = $_GET['target'];
    $depth = isset($_GET['depth']) ? $_GET['depth'] : 3;
    settype($depth, 'int');
    if($depth > 10 || $depth < 1) $depth = 3;

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

    $f = new Formats\JsonFormatter();
    echo($f->FormatObject($current_resource, $depth)."\n");

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
?>