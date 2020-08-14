<?php
namespace Api\Resources;

use Api\Schemas;

class AssignmentTargets extends Resource implements Schemas\AssignmentTargets {
    protected $Users;
    protected $Groups;
    protected $AllUsers;
    protected $Assignment;

    public function CreateSubResource(/* object */ $source){
        $current_user = $this->GetContext()->GetUser();
        if($this->Assignment->GetAssigningUser()->GetId() != $current_user->GetId())
            throw new Exceptions\MethodNotAllowed('POST');

        if(is_array($source->targets)){
            foreach($source->targets as $target){
                $target_type = $target->type;
                $target_id = $target->id;
                $this->Assignment->AddTarget($target_type, $target_id);
            }
        }
    }

    public function __construct($assignment){
        $this->Users = [];
        $this->Groups = [];
        $this->AllUsers = [];
        $this->Assignment = $assignment;

        $targets = $this->Assignment->GetTargets();

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