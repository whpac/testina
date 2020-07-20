<?php
namespace Api\Resources;

use Api\Exceptions;

class Assignment extends Resource{

    protected function LazyLoad($assignment, $name){
        $current_user = $this->GetContext()->GetUser();

        $this->AddSubResource('id', new ValueResource($assignment->GetId()));
        $this->AddSubResource('attempt_limit', new ValueResource($assignment->GetAttemptLimit()));
        $this->AddSubResource('time_limit', new ValueResource($assignment->GetTimeLimit()->format('Y-m-d H:i:s')));
        $this->AddSubResource('assignment_date', new ValueResource($assignment->GetAssignmentDate()->format('Y-m-d H:i:s')));
        $this->AddSubResource('attempt_count', new ValueResource($assignment->CountUserAttempts($current_user)));
        $this->AddSubResource('score', new ValueResource($assignment->GetAverageScore($current_user)));
        $this->AddSubResource('test', new Test($assignment->GetTest()));
        $this->AddSubResource('attempts', new AttemptCollection($assignment));
        $this->AddSubResource('assigned_by', new User($assignment->GetAssigningUser()));
        return true;
    }

    public function Update(/* object */ $source){
        $assignment = $this->GetConstructorArgument();
        $current_user = $this->GetContext()->GetUser();
        if($assignment->GetAssigningUser()->GetId() != $current_user->GetId())
            throw new Exceptions\MethodNotAllowed('PUT');

        if(is_array($source->targets)){
            foreach($source->targets as $target){
                $target_type = $target->type;
                $target_id = $target->id;
                $assignment->AddTarget($target_type, $target_id);
            }
        }
    }
}
?>