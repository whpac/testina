<?php
namespace Api\Resources;

use Api\Schemas;

class User extends Resource implements Schemas\User{
    protected $User;

    public function __construct($user){
        parent::__construct();

        if(is_null($user)) throw new \Exception('$user nie może być null');
        $this->User = $user;
    }

    public function GetKeys(): array{
        return [
            'id',
            'first_name',
            'last_name',
            'groups'
        ];
    }

    public function id(): string{
        return $this->User->GetId();
    }

    public function first_name(): string{
        return $this->User->GetFirstName();
    }

    public function last_name(): string{
        return $this->User->GetLastName();
    }

    public function groups(): ?Schemas\Collection{
        if($this->User->GetId() != $this->GetContext()->GetUser()->GetId()) return null;

        $groups = $this->User->GetGroups();
        $out_groups = [];

        foreach($groups as $group){
            $out_groups[] = new Group($group);
        }

        $collection = new Collection($out_groups);
        $collection->SetContext($this->GetContext());
        return $collection;
    }
}
?>