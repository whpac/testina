<?php
namespace Session;

use \UEngine\Modules\Core\Properties;
use \UEngine\Modules\Core\RichException;
use Database\DatabaseManager;
use Database\Queries;

class SessionManager {
    protected static $key_provider = null;
    protected static $session_id;
    protected static $data;
    protected static $session_duration;
    
    public static function SetKeyProvider(Key\KeyProvider $provider){
        self::$key_provider = $provider;
    }

    protected static function GetKeyProvider(){
        if(self::$key_provider == null) self::SetKeyProvider(new Key\StaticKeyProvider('(null)'));
        return self::$key_provider;
    }

    public static function Start($time = 3600){
        self::$session_duration = $time;

        if(!self::GetKeyProvider()->KeyExists())
            $key = self::GenerateKey();
    
        // Create a new session instead of an outdated one
        if(strtotime(self::GetExpireTime()) < time())
            $key = self::GenerateKey();

        self::$session_id = self::GetSessionId();
        $key = self::GetKeyProvider()->GetKey();

        if(empty(self::$session_id)) self::$session_id = 0;
    
        $result = DatabaseManager::GetProvider()
                ->Table(Properties::Get('session.tables.session_data'))
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

    protected static function GetSessionId(){
        $key = self::GetKeyProvider()->GetKey();
        $result = DatabaseManager::GetProvider()
                ->Table(Properties::Get('session.tables.sessions'))
                ->Select(['id'])
                ->Where('session_key', '=', $key)
                ->Run();
        if($result === false) throw new RichException('Nie udało się odczytać identyfikatora sesji', DatabaseManager::GetProvider()->GetError());

        $result = $result->fetch_assoc();
        return $result['id'];
    }

    protected static function GetExpireTime(){
        $key = self::GetKeyProvider()->GetKey();

        $result = DatabaseManager::GetProvider()
                ->Table(Properties::Get('session.tables.sessions'))
                ->Select(['expire_date'])
                ->Where('session_key', '=', $key)
                ->Run();

        if(!$result) throw new RichException('Nie udało się odczytać terminu wygaśnięcia sesji.', DatabaseManager::GetProvider()->GetError());

        $result = $result->fetch_assoc();
        return $result['expire_date'];
    }
    
    public static function Get($key, $default_value = null){
        if(!isset(self::$data[$key])) return $default_value;
        return self::$data[$key];
    }
    
    public static function Set($key, $value){
        self::$data[$key] = $value;

        $result = DatabaseManager::GetProvider()
                ->Table(Properties::Get('session.tables.session_data'))
                ->Insert()
                ->Value('session_id', self::$session_id)
                ->Value('key', $key)
                ->Value('value', $value)
                ->Run();

        if(!$result) throw new RichException('Nie udało się zapisać danych sesji.', DatabaseManager::GetProvider()->GetError());
    }

    protected static function GenerateKey(){
        $unique = false;
        $key = '';
        while(!$unique){
            $key = Key\KeyGenerator::Generate();
            $res = DatabaseManager::GetProvider()
                    ->Table(Properties::Get('session.tables.sessions'))
                    ->Select(['id'])
                    ->Where('session_key', '=', $key)
                    ->Run();
            if($res->num_rows == 0) $unique = true;
        }

        DatabaseManager::GetProvider()
                ->Table(Properties::Get('session.tables.sessions'))
                ->Insert()
                ->Value('session_key', $key)
                ->Value('expire_date', date('Y-m-d H:i:s', time()+self::$session_duration))
                ->Run();
                
        self::GetKeyProvider()->SetKey($key);
        return $key;
    }

    /*protected static function Renew(){
        DatabaseManager::GetProvider()->Query('UPDATE '.Properties::Get('session.tables.sessions').' SET expire_date = FROM_UNIXTIME('.(time()+3600).') WHERE id='.self::$session_id);
    }*/
}
?>