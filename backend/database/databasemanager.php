<?php
namespace Database;

/**
 * Zarządca używanych baz danych
 */
class DatabaseManager {
    protected static $current_provider = null;

    public static function SetProvider(DatabaseProvider $provider){
        self::$current_provider = $provider;
    }

    public static function GetProvider(){
        if(self::$current_provider === null) self::$current_provider = new NullDatabase();
        return self::$current_provider;
    }

    public static function IsProviderRegistered(){
        return (self::$current_provider !== null && !(self::$current_provider instanceof NullDatabase));
    }
}
?>