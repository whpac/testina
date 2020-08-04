<?php
namespace Api\Resources;

use Api\Schemas;

class AssignmentTargets extends Resource implements Schemas\AssignmentTargets {
    protected $Users;
    protected $Groups;

    public function __construct(array $targets){
        $this->Users = [];
        $this->Groups = [];

        foreach($targets as $target){
            if($target instanceof \Entities\User){
                $this->Users[$target->GetId()] = new User($target);
            }elseif($target instanceof \Entities\Group){
                $this->Groups[$target->GetId()] = new Group($target);
            }
        }
    }

    public function GetKeys(): array{
        return [
            'groups',
            'users'
        ];
    }

    public function groups(): Schemas\Collection{
        return new Collection($this->Groups);
    }

    public function users(): Schemas\Collection{
        return new Collection($this->Users);
    }
}
?>