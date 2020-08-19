<?php
namespace Database;

use Log\Logger;
use Log\LogChannels;

/**
 * Dostawca bazy danych MySQL
 */
class MySQL implements DatabaseProvider {
    private $host;
    private $user;
    private $pass;
    private $base;
    private $port;
    private $socket;
    private $connector;

    /**
     * Tworzy łącze do bazy danych wykorzystując podane poświadczenia
     */
    public function __construct($host = null, $user = null, $password = null, $database = null, $port = null, $socket = null){
        $this->host = (!is_null($host) ? $host : ini_get('mysqli.default_host'));
        $this->user = (!is_null($user) ? $user : ini_get('mysqli.default_user'));
        $this->pass = (!is_null($password) ? $password : ini_get('mysqli.default_pw'));
        $this->base = (!is_null($database) ? $database : '');
        $this->port = (!is_null($port) ? $port : ini_get('mysqli.default_port'));
        $this->socket = (!is_null($socket) ? $socket : ini_get('mysqli.default_socket'));
    }

    /**
     * Łączy się z bazą danych, przy użyciu danych przekazanych do konstruktora
     */
    public function Connect(){
        $this->connector = new \mysqli($this->host, $this->user, $this->pass, $this->base, $this->port, $this->socket);
    }

    /**
     * Zamyka połączenie z bazą danych
     */
    public function Close(){
        $this->connector->close();
    }

    /**
     * Zwraca treść ostatniego błędu
     */
    public function GetError(){
        return $this->connector->error;
    }

    /**
     * Zwraca kod ostatniego błędu
     */
    private function GetErrorNumber(){
        return $this->connector->errno;
    }

    /**
     * Wykonuje zapytanie do bazy danych
     * @param $query Zapytanie w postaci tekstu lub obiektu
     */
    public function Query($query){
        if(!is_string($query)){
            $query = Translators\MySQLTranslator::TranslateQuery($query);
        }
        return $this->connector->query($query);
    }

    /**
     * Zwraca odnośnik do tabeli o podanej nazwie
     * @param $table Nazwa tabeli
     */
    public function Table($table){
        if(!$this->TableExists($table)){
            Logger::Log('Tabela "'.$table.'" nie istnieje w wybranej bazie danych: '.$this->GetError(), LogChannels::DATABASE);
            throw new \Exception('Żądana tabela nie istnieje w wybranej bazie danych.');
        }
        return new Entities\Table($this, $table);
    }

    /**
     * Sprawdza, czy tabela o podanej nazwie istnieje
     * @param $table Nazwa tabeli do sprawdzenia
     */
    public function TableExists($table){
        $this->Query('SELECT * FROM `'.$table.'` LIMIT 1');
        if($this->GetErrorNumber() == 0) return true;
        if($this->GetErrorNumber() == 1146) return false;

        Logger::Log('Nie udało się sprawdzić, czy tabela "'.$table.'" istnieje: '.$this->GetError(), LogChannels::DATABASE);
        throw new \Exception('Nie udało się sprawdzić, czy podana tabela istnieje w bazie danych.');
    }

    /**
     * Wybiera bazę danych o podanej nazwie
     */
    public function SelectDB($name){
        if($this->connector->select_db($name)) return;

        Logger::Log('Nie udało się wybrać bazy danych "'.$name.'": '.$this->GetError(), LogChannels::DATABASE);
        throw new \Exception('Nie udało się wybrać odpowiedniej bazy danych.');
    }

    /**
     * Zwraca łącze do bazy danych
     */
    private function GetConnector(){
        return $this->connector;
    }
}
?>