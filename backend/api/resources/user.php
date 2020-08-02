<?php
namespace Api\Resources;

use Api\Schemas;

class User extends Resource implements Schemas\User{
    protected $User;

    protected function LazyLoad($user, $name){
        /*$this->AddSubResource('id', new ValueResource($user->GetId()));
        $this->AddSubResource('first_name', new ValueResource($user->GetFirstName()));
        $this->AddSubResource('last_name', new ValueResource($user->GetLastName()));

        return true;*/
    }

    public function __construct($user){
        parent::__construct($user);
        if(is_null($user)) throw new \Exception('$user nie może być null');
        $this->User = $user;
    }

    public function GetKeys(): array{
        return [
            'id',
            'first_name',
            'last_name'
        ];
    }

    public function id(): int{
        return $this->User->GetId();
    }

    public function first_name(): string{
        return $this->User->GetFirstName();
    }

    public function last_name(): string{
        return $this->User->GetLastName();
    }
}
?>