<?php
namespace Api;

/**
 * Klasa reprezentuje kontekst zabezpieczeń, na podstawie którego
 * zasoby decydują, jakie informacje udostępnić
 */
class Context{
    protected /* User */ $user;

    public function __construct(\Auth\Users\User $user){
        $this->user = $user;
    }

    public function GetUser(){
        return $this->user;
    }

    public function IsAuthorized(){
        return $this->user->GetId() !== '0';
    }
}
?>