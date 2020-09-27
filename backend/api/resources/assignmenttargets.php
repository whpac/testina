<?php
namespace Api\Resources;

use Api\Schemas;
use Api\Validation\TypeValidator;
use Api\Validation\ValueValidator;

class AssignmentTargets extends Resource implements Schemas\AssignmentTargets {
    protected $Users;
    protected $Groups;
    protected $AllUsers;
    protected $Assignment;

    public function CreateSubResource(/* object */ $source){
        TypeValidator::AssertIsObject($source);

        $current_user = $this->GetContext()->GetUser();
        if($this->Assignment->GetAssigningUser()->GetId() != $current_user->GetId())
            throw new Exceptions\MethodNotAllowed('POST');

        if(is_array($source->targets)){
            foreach($source->targets as $target){
                TypeValidator::AssertIsInt($target->id, 'id');
                TypeValidator::AssertIsInt($target->type, 'type');
                ValueValidator::AssertIsNonNegative($target->id, 'id');
                ValueValidator::AssertIsInRange($target->type, 0, 1, 'type');

                $target_type = $target->type;
                $target_id = $target->id;
                $this->Assignment->AddTarget($target_type, $target_id);
            }
        }
    }

    public function Delete(/* object */ $source){
        TypeValidator::AssertIsObject($source);

        $current_user = $this->GetContext()->GetUser();
        if($this->Assignment->GetAssigningUser()->GetId() != $current_user->GetId())
            throw new Exceptions\MethodNotAllowed('DELETE');

        if(is_array($source->targets)){
            foreach($source->targets as $target){
                TypeValidator::AssertIsInt($target->id, 'id');
                TypeValidator::AssertIsInt($target->type, 'type');

                $target_type = $target->type;
                $target_id = $target->id;
                $this->Assignment->RemoveTarget($target_type, $target_id);
            }
        }
    }

    public function __construct($assignment){
        parent::__construct();

        $this->Users = [];
        $this->Groups = [];
        $this->AllUsers = [];
        $this->Assignment = $assignment;

        $targets = $this->Assignment->GetTargets();

        foreach($targets as $target){
            if($target instanceof \Auth\Users\User){
                $this->Users[] = $target->GetId();
                $this->AllUsers[$target->GetId()] = true;
            }elseif($target instanceof \Auth\Users\Group){
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