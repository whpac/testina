<?php
namespace Auth;

use Database\DatabaseManager;
use Log\Logger;
use Log\LogChannels;
use Session\SessionManager;

define('SESSION_USER_ID', '__user_id');
define('ANONYMOUS_USER_ID', '0');

class AuthManager {
    private static $users_table;
    private static $id_column;
    private static $login_column;
    private static $password_column;
    private static $hash_algorithm;

    private static $current_user;
    private static $user_factory = null;

    public static function Initialize($users_table, $id_column, $login_column, $password_column, $hash_algorithm){
        self::$users_table = $users_table;
        self::$id_column = $id_column;
        self::$login_column = $login_column;
        self::$password_column = $password_column;

        $supported_algos = hash_algos();
        if(!in_array($hash_algorithm, $supported_algos)){
            Logger::Log('Algorytm '.$hash_algorithm.' nie jest dostępny na tym serwerze.', LogChannels::APPLICATION_ERROR);
            throw new \Exception('Wybrany algorytm haszowania nie jest dostępny na tym serwerze.');
        }
        self::$hash_algorithm = $hash_algorithm;
    }

    public static function TryToLogIn($login, $password){
        if(!DatabaseManager::IsProviderRegistered()){
            Logger::Log('Nie zarejestrowano dostawcy bazy danych.', LogChannels::APPLICATION_ERROR);
            throw new \Exception('Nie zarejestrowano dostawcy bazy danych.');
        }

        $login = strtolower($login);
        $password_hash = hash(self::$hash_algorithm, $password);
        $password_hash = strtolower($password_hash);

        $result = DatabaseManager::GetProvider()
                ->Table(self::$users_table)
                ->Select([self::$id_column, self::$login_column, self::$password_column])
                ->Where(self::$login_column, '=', $login)
                ->AndWhere(self::$password_column, '=', $password_hash)
                ->Run();
        
        if($result->num_rows == 0) return new AuthResult(false, null, null, AuthResult::REASON_NO_USERS_MATCHING);
        if($result->num_rows >= 2) return new AuthResult(false, null, null, AuthResult::REASON_MULTIPLE_USERS_MATCHING);

        $row = $result->fetch_assoc();

        if($row[self::$login_column] != $login || $row[self::$password_column] != $password_hash)
            return new AuthResult(false, null, null, AuthResult::REASON_POSSIBLE_SQL_INJECTION);

        self::ChangeUser($row[self::$id_column]);

        return new AuthResult(true, $row[self::$id_column], ['login' => $row[self::$login_column]]);
    }

    public static function IsAuthorized(){
        $uid = SessionManager::Get(SESSION_USER_ID);
        return (!is_null($uid) && $uid !== ANONYMOUS_USER_ID);
    }

    private static function ChangeUser($user_id){
        SessionManager::Set(SESSION_USER_ID, $user_id);
        self::RestoreCurrentUser();
    }

    public static function LogOut(){
        self::ChangeUser(ANONYMOUS_USER_ID);
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