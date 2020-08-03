<?php
namespace Api\Resources;

use Api\Exceptions;
use Api\Schemas;

class Assignment extends Resource implements Schemas\Assignment{
    protected $Assignment;

    protected function LazyLoad($assignment, $name){
        /*$current_user = $this->GetContext()->GetUser();

        $this->AddSubResource('id', new ValueResource($assignment->GetId()));
        $this->AddSubResource('attempt_limit', new ValueResource($assignment->GetAttemptLimit()));
        $this->AddSubResource('time_limit', new ValueResource($assignment->GetTimeLimit()->format('Y-m-d H:i:s')));
        $this->AddSubResource('assignment_date', new ValueResource($assignment->GetAssignmentDate()->format('Y-m-d H:i:s')));
        $this->AddSubResource('attempt_count', new ValueResource($assignment->CountUserAttempts($current_user)));
        $this->AddSubResource('score', new ValueResource($assignment->GetAverageScore($current_user)));
        $this->AddSubResource('test', new Test($assignment->GetTest()));
        $this->AddSubResource('attempts', new AttemptCollection($assignment));
        $this->AddSubResource('assigned_by', new User($assignment->GetAssigningUser()));
        return true;*/
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

    public function __construct($assignment){
        parent::__construct($assignment);
        if(is_null($assignment)) throw new \Exception('$assignment nie może być null.');
        $this->Assignment = $assignment;
    }

    public function GetKeys(): array{
        return [
            'id',
            'attempt_limit',
            'time_limit',
            'assignment_date',
            'score',
            'test',
            'assigned_by',
            'attempt_count',
            'attempts'
        ];
    }

    public function id(): int{
        return $this->Assignment->GetId();
    }

    public function attempt_limit(): int{
        return $this->Assignment->GetAttemptLimit();
    }

    public function time_limit(): \DateTime{
        return $this->Assignment->GetTimeLimit();
    }

    public function assignment_date(): \DateTime{
        return $this->Assignment->GetAssignmentDate();
    }

    public function score(): ?float{
        $current_user = $this->GetContext()->GetUser();
        return $this->Assignment->GetAverageScore($current_user);
    }

    public function test(): Schemas\Test{
        $t = new Test($this->Assignment->GetTest());
        $t->SetContext($this->GetContext());
        return $t;
    }

    public function assigned_by(): Schemas\User{
        $u = new User($this->Assignment->GetAssigningUser());
        $u->SetContext($this->GetContext());
        return $u;
    }

    public function attempt_count(): int{
        $current_user = $this->GetContext()->GetUser();
        return $this->Assignment->CountUserAttempts($current_user);
    }

    public function attempts(): Schemas\Collection{
        $current_user = $this->GetContext()->GetUser();
        $attempts = $this->Assignment->GetUserAttempts($current_user);
        $out_attempts = [];

        foreach($attempts as $attempt){
            $out_attempts[$attempt->GetId()] = new Attempt($attempt);
        }

        $collection = new AttemptCollection($out_attempts);
        $collection->SetContext($this->GetContext());
        return $collection;
    }
}
?>