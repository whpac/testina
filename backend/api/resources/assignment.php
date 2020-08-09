<?php
namespace Api\Resources;

use Api\Exceptions;
use Api\Schemas;

class Assignment extends Resource implements Schemas\Assignment{
    protected $Assignment;

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
        $keys = [
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

        if($this->Assignment->GetAssigningUser()->GetId() == $this->GetContext()->GetUser()->GetId()){
            $keys[] = 'target_count';
            $keys[] = 'targets';
        }

        return $keys;
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

    public function score_current(): ?float{
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

    public function target_count(): ?int{
        if($this->Assignment->GetAssigningUser()->GetId() != $this->GetContext()->GetUser()->GetId()) return null;
        
        return count($this->Assignment->GetTargets());
    }

    public function targets(): ?Schemas\AssignmentTargets{
        if($this->Assignment->GetAssigningUser()->GetId() != $this->GetContext()->GetUser()->GetId()) return null;

        $targets = $this->Assignment->GetTargets();
        return new AssignmentTargets($targets);
    }
}
?>