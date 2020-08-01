<?php
function ClassLoader($name){
    $name = strtolower($name);
    $name = str_replace('\\', '/', $name);

    // Only apply this autoloader to classes in specified namespaces
    $namespaces = ['api', 'entities', 'layout', 'handling', 'utils'];
    $is_found = false;

    foreach($namespaces as $ns){
        if(substr($name, 0, strlen($ns.'/')) == $ns.'/'){
            $is_found = true;
            break;
        }
    }

    if(!$is_found) return;

    if(file_exists(__DIR__.'/'.$name.'.php'))
        include(__DIR__.'/'.$name.'.php');
}

spl_autoload_register('ClassLoader');
?>