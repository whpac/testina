<?php
define('CACHE_TIME', 0); // Do testowania
// define('CACHE_TIME', 604800); // 604800 sekund = tydzień

require('utils/mime.php');

// Odczytaj nazwę żądanego pliku i uzupełnij ścieżkę o początek
$target_file = $_GET['file'];
$target_file = __DIR__.'/../frontend/'.$target_file;

// Sprawdź czy żądany plik istnieje, jeśli nie - zwróć 404 Not Found
if(!file_exists($target_file)){
    header('X-Response-Code: 404', true, 404);
    return;
}

// Wyślij nagłówek z typem pliku
$mime = Utils\Mime::GetTypeByFileName($target_file);
header('Content-Type: '.$mime);

// Wyślij nagłówek cache'owania
if(CACHE_TIME > 0){
    header('Cache-Control: public, max-age='.CACHE_TIME);
}else{
    header('Cache-Control: no-cache');
}

// Odczytaj zawartość pliku docelowego
$content = file_get_contents($target_file);

// Wyślij nagłówek ETag na podstawie hasza md5 pliku
$content_etag = md5($content);
header('ETag: "'.$content_etag.'"');

// Sprawdź ETag z nadesłanymi przez przeglądarkę
$if_none_match = explode(',', $_SERVER['HTTP_IF_NONE_MATCH']);

$is_etag_found = false;
foreach($if_none_match as $request_etag){
    $request_etag = trim($request_etag, ' "');
    if($request_etag == $content_etag){
        $is_etag_found = true;
        break;
    }
}

// Jeśli odnaleziono ETag, zwróć odpowiedź 304 Not Modified
if($is_etag_found){
    header('X-Response-Code: 304', true, 304);
    return;
}

echo($content);
?>