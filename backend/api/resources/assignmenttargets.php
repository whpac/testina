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
                $this->Users[] = $target->GetId();
            }elseif($target instanceof \Entities\Group){
                $this->Groups[] = $target->GetId();
            }
        }
    }

    public function GetKeys(): array{
        return [
            'group_ids',
            'user_ids'
        ];
    }

    public function group_ids(): array{
        return $this->Groups;
    }

    public function user_ids(): array{
        return $this->Users;
    }
}
?>