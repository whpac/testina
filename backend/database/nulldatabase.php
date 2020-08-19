<?php
namespace Database;

use Log\Logger;
use Log\LogChannels;

class NullDatabase implements DatabaseProvider {

    public function Connect(){
        Logger::Log('Nie zarejestrowano dostawcy bazy danych.', LogChannels::APPLICATION_ERROR);
        throw new \Exception('Nie zarejestrowano dostawcy bazy danych.');
    }

    public function Close(){
        Logger::Log('Nie zarejestrowano dostawcy bazy danych.', LogChannels::APPLICATION_ERROR);
        throw new \Exception('Nie zarejestrowano dostawcy bazy danych.');
    }

    public function Query($query){
        Logger::Log('Nie zarejestrowano dostawcy bazy danych.', LogChannels::APPLICATION_ERROR);
        throw new \Exception('Nie zarejestrowano dostawcy bazy danych.');
    }

    public function GetError(){
        Logger::Log('Nie zarejestrowano dostawcy bazy danych.', LogChannels::APPLICATION_ERROR);
        throw new \Exception('Nie zarejestrowano dostawcy bazy danych.');
    }
}
?>