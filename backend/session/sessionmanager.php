<?php
namespace Session;

use Database\DatabaseManager;
use Database\Queries;

use Log\Logger;
use Log\LogChannels;

define('TABLE_SESSIONS', 'sessions');
define('TABLE_SESSION_DATA', 'session_data');

/**
 * Menedżer sesji
 */
class SessionManager {
    protected static $key_provider = null;
    protected static $session_id;
    protected static $data;
    protected static $session_duration;
    
    /**
     * Ustawia dostawcę klucza sesji
     * @param @provider Dostawca klucza sesji
     */
    public static function SetKeyProvider(Key\KeyProvider $provider){
        self::$key_provider = $provider;
    }

    /**
     * Zwraca dostawcę klucza sesji
     */
    protected static function GetKeyProvider(){
        if(self::$key_provider == null){
            Logger::Log('Nie ustawiono dostawcy klucza sesji', LogChannels::APPLICATION_ERROR);
            throw new \Exception('Nie ustawiono dostawcy klucza sesji.');
        }
        return self::$key_provider;
    }

    /**
     * Rozpoczyna sesję lub tworzy nową
     * @param $time Czas, po którym nowa sesja się przeterminuje
     */
    public static function Start($time = 3600){
        self::$session_duration = $time;

        if(!self::GetKeyProvider()->KeyExists())
            $key = self::GenerateKey();
    
        // Utwórz nową sesję zamiast przestarzałej
        if(self::GetExpireTime() < new \DateTime())
            $key = self::GenerateKey();

        self::$session_id = self::GetSessionId();
        $key = self::GetKeyProvider()->GetKey();

        if(empty(self::$session_id)) self::$session_id = 0;
    
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_SESSION_DATA)
                ->Select()
                ->Where('session_id', '=', self::$session_id)
                ->OrderBy('id')
                ->Run();
        
        if($result === false){
            Logger::Log('Nie udało się zapisać danych sesji: '.DatabaseManager::GetProvider()->GetError(), LogChannels::SESSION_FAILURE);
            throw new \Exception('Nie udało się załadować danych sesji.');
        }

        for($i=0; $i<$result->num_rows; $i++){
            $row = $result->fetch_assoc();
            self::$data[$row['key']] = $row['value'];
        } 
    }

    /**
     * Zwraca identyfikator sesji
     */
    public static function GetSessionId(){
        $key = self::GetKeyProvider()->GetKey();
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_SESSIONS)
                ->Select(['id'])
                ->Where('session_key', '=', $key)
                ->Run();
        if($result === false){
            Logger::Log('Nie udało się odczytać identyfikatora sesji: '.DatabaseManager::GetProvider()->GetError(), LogChannels::SESSION_FAILURE);
            throw new \Exception('Nie udało się odczytać identyfikatora sesji.');
        }

        $result = $result->fetch_assoc();
        return $result['id'];
    }

    /**
     * Zwraca termin ważności sesji
     */
    public static function GetExpireTime(){
        $key = self::GetKeyProvider()->GetKey();

        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_SESSIONS)
                ->Select(['expire_date'])
                ->Where('session_key', '=', $key)
                ->Run();

        if(!$result){
            Logger::Log('Nie udało się odczytać terminu wygaśnięcia sesji: '.DatabaseManager::GetProvider()->GetError(), LogChannels::SESSION_FAILURE);
            throw new \Exception('Nie udało się odczytać terminu wygaśnięcia sesji.');
        }

        $result = $result->fetch_assoc();
        return new \DateTime($result['expire_date']);
    }
    
    /**
     * Zwraca wartość zmiennej sesji
     * @param $key Nazwa zmiennej
     * @param $default_value Wartość zwracana, gdy zmienna nie została zdefiniowana
     */
    public static function Get($key, $default_value = null){
        if(!isset(self::$data[$key])) return $default_value;
        return self::$data[$key];
    }
    
    /**
     * Ustawia wartość zmiennej sesji
     * @param $key Nazwa zmiennej
     * @param $value Wartość zmiennej do zapisania
     */
    public static function Set($key, $value){
        self::$data[$key] = $value;

        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_SESSION_DATA)
                ->Insert()
                ->Value('session_id', self::$session_id)
                ->Value('key', $key)
                ->Value('value', $value)
                ->Run();

        if(!$result) {
            Logger::Log('Nie udało się zapisać danych sesji: '.DatabaseManager::GetProvider()->GetError(), LogChannels::SESSION_FAILURE);
            throw new \Exception('Nie udało się zapisać danych sesji.');
        }
    }

    /**
     * Generuje klucz sesji
     */
    protected static function GenerateKey(){
        $unique = false;
        $key = '';
        while(!$unique){
            $key = Key\KeyGenerator::Generate();
            $res = DatabaseManager::GetProvider()
                    ->Table(TABLE_SESSIONS)
                    ->Select(['id'])
                    ->Where('session_key', '=', $key)
                    ->Run();
            if($res->num_rows == 0) $unique = true;
        }

        DatabaseManager::GetProvider()
                ->Table(TABLE_SESSIONS)
                ->Insert()
                ->Value('session_key', $key)
                ->Value('expire_date', date('Y-m-d H:i:s', time()+self::$session_duration))
                ->Run();
                
        self::GetKeyProvider()->SetKey($key);
        return $key;
    }
}
?>