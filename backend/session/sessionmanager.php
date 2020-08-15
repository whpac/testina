<?php
namespace Session;

use \UEngine\Modules\Core\RichException;
use Database\DatabaseManager;
use Database\Queries;

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
        if(self::$key_provider == null) self::SetKeyProvider(new Key\StaticKeyProvider('(null)'));
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
        if(strtotime(self::GetExpireTime()) < time())
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
        
        if($result === false) throw new RichException('Nie udało się załadować danych sesji.', DatabaseManager::GetProvider()->GetError());
        for($i=0; $i<$result->num_rows; $i++){
            $row = $result->fetch_assoc();
            self::$data[$row['key']] = $row['value'];
        } 
    }

    /**
     * Zwraca identyfikator sesji
     */
    protected static function GetSessionId(){
        $key = self::GetKeyProvider()->GetKey();
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_SESSIONS)
                ->Select(['id'])
                ->Where('session_key', '=', $key)
                ->Run();
        if($result === false) throw new RichException('Nie udało się odczytać identyfikatora sesji', DatabaseManager::GetProvider()->GetError());

        $result = $result->fetch_assoc();
        return $result['id'];
    }

    /**
     * Zwraca termin ważności sesji
     */
    protected static function GetExpireTime(){
        $key = self::GetKeyProvider()->GetKey();

        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_SESSIONS)
                ->Select(['expire_date'])
                ->Where('session_key', '=', $key)
                ->Run();

        if(!$result) throw new RichException('Nie udało się odczytać terminu wygaśnięcia sesji.', DatabaseManager::GetProvider()->GetError());

        $result = $result->fetch_assoc();
        return $result['expire_date'];
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

        if(!$result) throw new RichException('Nie udało się zapisać danych sesji.', DatabaseManager::GetProvider()->GetError());
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

    /*protected static function Renew(){
        DatabaseManager::GetProvider()->Query('UPDATE '.TABLE_SESSIONS.' SET expire_date = FROM_UNIXTIME('.(time()+3600).') WHERE id='.self::$session_id);
    }*/
}
?>