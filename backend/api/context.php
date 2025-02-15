<?php
namespace Api;

/**
 * Klasa reprezentuje kontekst zabezpieczeń, na podstawie którego
 * zasoby decydują, jakie informacje udostępnić
 */
class Context{
    protected /* User */ $User;
    protected /* string */ $Method;

    public function __construct(\Auth\Users\User $user, string $method){
        $this->User = $user;
        $this->Method = strtoupper($method);
    }

    public function GetUser(){
        return $this->User;
    }

    public function IsAuthorized(){
        $id = $this->User->GetId();
        return $id !== '0' && !is_null($id);
    }

    public function GetMethod(){
        return $this->Method;
    }
}
?>