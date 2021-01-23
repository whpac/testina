<?php
namespace Api\Resources;

use Api\Exceptions;

use Log\Logger;
use Log\LogChannels;

class FileError extends Resource {

    public function CreateSubResource(/* object */ $source){
        try{
            $message = json_encode($source);
            if(strlen($message) > 1000) $message = \substr($message, 0, 1000);
            Logger::Log('Błąd JavaScript: '.$message, LogChannels::APPLICATION_ERROR);
        }catch(\Throwable $e){
            Logger::Log('Błąd zapisu błędu: '.$e->getMessage(), LogChannels::APPLICATION_ERROR);
        }
    }
}
?>