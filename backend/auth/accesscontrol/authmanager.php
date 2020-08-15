<?php
namespace Auth\AccessControl;

use \UEngine\Modules\Core\RichException;
use Session\SessionManager;

define('SESSION_USER_ID', '__user_id');
define('ANONYMOUS_USER_ID', 0);

class AuthManager {
    protected static $current_user;
    protected static $user_factory = null;

    public static function IsAuthorized(){
        $uid = SessionManager::Get(SESSION_USER_ID);
        return (!is_null($uid) && $uid != ANONYMOUS_USER_ID);
    }

    public static function ChangeUser($user_id){
        SessionManager::Set(SESSION_USER_ID, $user_id);
        self::RestoreCurrentUser();
    }

    public static function LogOff(){
        self::ChangeUser(ANONYMOUS_USER_ID);
    }

    public static function GetCurrentUser(){
        return self::$current_user;
    }

    public static function RestoreCurrentUser(){
        if(is_null(self::$user_factory)) throw new RichException('Nie zarejestrowano żadnej fabryki użytkowników.');

        $user_id = SessionManager::Get(SESSION_USER_ID, ANONYMOUS_USER_ID);
        self::$current_user = self::$user_factory->Create($user_id);
    }

    public static function RegisterUserFactory(UserFactory $factory){
        self::$user_factory = $factory;
    }
}
?>