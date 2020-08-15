<?php
namespace Auth;

class AuthHandler {
    protected static $handlers;
    protected static $logout_var;
    public static $last_result = null;

    public static function HandleAuthIfNecessary(){
        if(isset($_GET[self::$logout_var])){
            AccessControl\AuthManager::LogOff();
            return;
        }

        if(!self::IsHandlingNecessary()) return;
        $handler_key = $_POST['_handle_auth'];
        $result = self::$handlers[$handler_key]->Handle();
        self::$last_result = $result;

        if($result->IsSuccess()){
            AccessControl\AuthManager::ChangeUser($result->GetUserId());
        }
    }

    public static function IsHandlingNecessary(){
        if(!isset($_POST['_handle_auth'])) return false;
        $handler_key = $_POST['_handle_auth'];

        if(!isset(self::$handlers[$handler_key])) return false;
        $handler = self::$handlers[$handler_key];

        if($handler->RequiresLoggedOff() && AccessControl\AuthManager::IsAuthorized()) return false;
        return true;
    }

    public static function RegisterHandler($key, Providers\AuthHandler $handler){
        self::$handlers[$key] = $handler;
    }

    public static function RegisterLogoutHandler($get_var){
        self::$logout_var = $get_var;
    }
}
?>