<?php
/**
 * Funkcja odpowiedzialna za automatyczne ładowanie klas aplikacji Testina
 * Ładowane są tylko klasy w określonych przestrzeniach nazw
 */
function TestinaClassLoader($name){
    // Nazwy plików są pisane małymi literami; separatorem ścieżki jest '/'
    $name = strtolower($name);
    $name = str_replace('\\', '/', $name);

    // Wczytaj automatycznie tylko te przestrzenie nazw
    $namespaces = ['api', 'auth', 'database', 'entities', 'handling', 'layout', 'session', 'utils'];
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

spl_autoload_register('TestinaClassLoader');
?>