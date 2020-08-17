<?php
namespace Auth;

use UEngine\Modules\Core\RichException;
use Database\DatabaseManager;

class AuthManager {
    private static $users_table;
    private static $id_column;
    private static $login_column;
    private static $password_column;
    private static $hash_algorithm;

    public static function Initialize($users_table, $id_column, $login_column, $password_column, $hash_algorithm){
        self::$users_table = $users_table;
        self::$id_column = $id_column;
        self::$login_column = $login_column;
        self::$password_column = $password_column;

        $supported_algos = hash_algos();
        if(!in_array($hash_algorithm, $supported_algos))
            throw new RichException('Wybrany algorytm haszowania nie jest dostępny na tym serwerze.');
        self::$hash_algorithm = $hash_algorithm;
    }

    public static function TryToLogIn($login, $password){
        if(!DatabaseManager::IsProviderRegistered())
            throw new RichException('Nie zarejestrowano dostawcy bazy danych.');

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

        return new AuthResult(true, $row[self::$id_column], ['login' => $row[self::$login_column]]);
    }
}
?>