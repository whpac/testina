<?php
namespace Auth\Providers;

use UEngine\Modules\Core\RichException;
use Database\DatabaseManager;

class LoginPasswordDatabase extends LoginPassword {
    protected $users_table = '';
    protected $id_column = '';
    protected $login_column = '';
    protected $password_column = '';

    public function __construct($users_table, $id_column, $login_column, $password_column){
        $this->users_table = $users_table;
        $this->id_column = $id_column;
        $this->login_column = $login_column;
        $this->password_column = $password_column;
    }

    protected function CheckCredentialsPair($login, $password_hash){
        if(!DatabaseManager::IsProviderRegistered())
            throw new RichException('Nie zarejestrowano dostawcy bazy danych.');

        $login = strtolower($login);
        $password_hash = strtolower($password_hash);

        $result = DatabaseManager::GetProvider()
                ->Table($this->users_table)
                ->Select([$this->id_column, $this->login_column, $this->password_column])
                ->Where($this->login_column, '=', $login)
                ->AndWhere($this->password_column, '=', $password_hash)
                ->Run();
        
        if($result->num_rows == 0) return new AuthResult(false, null, null, AuthResult::REASON_NO_USERS_MATCHING);
        if($result->num_rows >= 2) return new AuthResult(false, null, null, AuthResult::REASON_MULTIPLE_USERS_MATCHING);

        $row = $result->fetch_assoc();

        if($row[$this->login_column] != $login || $row[$this->password_column] != $password_hash)
            return new AuthResult(false, null, null, AuthResult::REASON_POSSIBLE_SQL_INJECTION);

        return new AuthResult(true, $row[$this->id_column], ['login' => $row[$this->login_column]]);
    }
}
?>