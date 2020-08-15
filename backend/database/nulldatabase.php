<?php
namespace Database;

use \UEngine\Modules\Core\RichException;

class NullDatabase implements DatabaseProvider {

    public function Connect(){
        throw new RichException('Nie zarejestrowano dostawcy bazy danych.');
    }

    public function Close(){
        throw new RichException('Nie zarejestrowano dostawcy bazy danych.');
    }

    public function Query($query){
        throw new RichException('Nie zarejestrowano dostawcy bazy danych.');
    }

    public function GetError(){
        throw new RichException('Nie zarejestrowano dostawcy bazy danych.');
    }
}
?>