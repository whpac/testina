<?php
namespace Auth\Providers;

use \UEngine\Modules\Core\RichException;

abstract class LoginPassword implements AuthHandler {
    protected $hash_algorithm = 'sha256';
    private $checked_algorithm = null;          // Used to cache algorithm support check

    // $input = [$login, $password]
    public function Validate(array $input){
        if($this->checked_algorithm != $this->hash_algorithm){
            $algos = hash_algos();
            if(!in_array($this->hash_algorithm, $algos))
                throw new RichException('Wybrany algorytm haszowania nie jest dostępny na tym serwerze.');
            
            $this->checked_algorithm = $this->hash_algorithm;
        }

        $login = $input[0];
        $pass_hash = hash($this->hash_algorithm, $input[1]);
        return $this->CheckCredentialsPair($login, $pass_hash);
    }

    public function Handle(){
        return $this->Validate([$_POST['login'], $_POST['password']]);
    }

    public function RequiresLoggedOff(){
        return true;
    }

    protected abstract function CheckCredentialsPair($login, $password_hash);
}
?>