<?php
namespace Api\Resources;

use Api\Schemas;

class AssignmentTargets extends Resource implements Schemas\AssignmentTargets {
    protected $Users;
    protected $Groups;
    protected $AllUsers;

    public function __construct(array $targets){
        $this->Users = [];
        $this->Groups = [];
        $this->AllUsers = [];

        foreach($targets as $target){
            if($target instanceof \Entities\User){
                $this->Users[] = $target->GetId();
                $this->AllUsers[$target->GetId()] = true;
            }elseif($target instanceof \Entities\Group){
                $this->Groups[] = $target->GetId();
                $users = $target->GetUsers();
                foreach($users as $user){
                    $this->AllUsers[$user->GetId()] = true;
                }
            }
        }
    }

    public function GetKeys(): array{
        return [
            'group_ids',
            'user_ids',
            'all_user_ids'
        ];
    }

    public function group_ids(): array{
        return $this->Groups;
    }

    public function user_ids(): array{
        return $this->Users;
    }

    public function all_user_ids(): array{
        return array_keys($this->AllUsers);
    }
}
?>