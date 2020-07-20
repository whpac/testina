<?php
namespace Api\Resources;

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
}
?>