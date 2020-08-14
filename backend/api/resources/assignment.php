<?php
namespace Api\Resources;

use Api\Exceptions;
use Api\Schemas;

class Assignment extends Resource implements Schemas\Assignment{
    protected $Assignment;

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
            'score_current',
            'test',
            'assigned_by_id',
            'attempt_count',
            'attempts'
        ];

        if($this->Assignment->GetAssigningUser()->GetId() == $this->GetContext()->GetUser()->GetId()){
            $keys[] = 'targets';
            $keys[] = 'results';
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

    public function assigned_by_id(): int{
        return $this->Assignment->GetAssigningUser()->GetId();
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

        $collection = new AttemptCollection($out_attempts, $this->Assignment);
        $collection->SetContext($this->GetContext());
        return $collection;
    }

    public function targets(): ?Schemas\AssignmentTargets{
        if($this->Assignment->GetAssigningUser()->GetId() != $this->GetContext()->GetUser()->GetId()) return null;

        return new AssignmentTargets($this->Assignment);
    }

    public function results(): ?array{
        if($this->Assignment->GetAssigningUser()->GetId() != $this->GetContext()->GetUser()->GetId()) return null;

        $all_users = [];
        $targets = $this->Assignment->GetTargets();
        foreach($targets as $target){
            if($target instanceof \Entities\User){
                $all_users[$target->GetId()] = $target;
            }elseif($target instanceof \Entities\Group){
                $users = $target->GetUsers();
                foreach($users as $user){
                    $all_users[$user->GetId()] = $user;
                }
            }
        }

        $out_array = [];
        foreach($all_users as $user){
            $out_array[] = new AssignmentResults($this->Assignment, $user);
        }
        return $out_array;
    }
}
?>