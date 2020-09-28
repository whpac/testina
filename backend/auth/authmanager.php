<?php
namespace Auth;

use Database\DatabaseManager;
use Log\Logger;
use Log\LogChannels;
use Session\SessionManager;

define('SESSION_USER_ID', '__user_id');
define('ANONYMOUS_USER_ID', '0');

class AuthManager {
    private static $current_user;
    private static $user_factory = null;

    public static function IsAuthorized(){
        $uid = SessionManager::Get(SESSION_USER_ID);
        return (!is_null($uid) && $uid !== ANONYMOUS_USER_ID);
    }

    private static function ChangeUser($user_id){
        SessionManager::Set(SESSION_USER_ID, $user_id);
        self::RestoreCurrentUser();
    }

    public static function LogOut(){
        \Auth\ExternalLogin\TokenManager::RemoveCurrentSessionTokens();
        self::ChangeUser(ANONYMOUS_USER_ID);
        SessionManager::InvalidateSession();
    }

    public static function GetCurrentUser(){
        return self::$current_user;
    }

    public static function RestoreCurrentUser(){
        if(is_null(self::$user_factory)){
            Logger::Log('Nie zarejestrowano żadnej fabryki użytkowników.', LogChannels::APPLICATION_ERROR);
            throw new \Exception('Nie zarejestrowano żadnej fabryki użytkowników.');
        }

        $user_id = SessionManager::Get(SESSION_USER_ID, ANONYMOUS_USER_ID);
        self::$current_user = self::$user_factory->Create($user_id);
    }

    public static function RegisterUserFactory(Users\UserFactory $factory){
        self::$user_factory = $factory;
    }

    public static function LogInExternalUser($user_id){
        self::ChangeUser($user_id);
    }
}
?>