<?php
namespace Api\Resources;

use Api\Exceptions;
use Api\Schemas;
use Api\Validation\TypeValidator;
use Api\Validation\ValueValidator;

class Assignment extends Resource implements Schemas\Assignment{
    protected $Assignment;

    public function Update($source){
        TypeValidator::AssertIsObject($source);
        TypeValidator::AssertIsInt($source->attempt_limit, 'attempt_limit');
        TypeValidator::AssertIsDateTimeString($source->time_limit, 'time_limit');
        ValueValidator::AssertIsNonNegative($source->attempt_limit, 'attempt_limit');

        $this->Assignment->Update($source->attempt_limit, new \DateTime($source->time_limit));
    }

    public function __construct($assignment){
        parent::__construct();

        if(is_null($assignment)) throw new \Exception('$assignment nie może być null.');
        $this->Assignment = $assignment;
    }

    public function GetKeys(): array{
        $is_accessible = true;
        if(!$this->GetContext()->IsAuthorized()) $is_accessible = false;
        if(!is_null($this->Assignment->GetLink())) $is_accessible = true;

        if(!$is_accessible) return [];

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
            $keys[] = 'scores';
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

    public function scores(): ?Schemas\Collection{
        if($this->Assignment->GetAssigningUser()->GetId() != $this->GetContext()->GetUser()->GetId()) return null;
        $users = \Entities\Attempt::GetUsersWhoAttempted($this->Assignment);
        $scores = [];
        foreach($users as $user){
            $scores[$user->GetId()] = $this->Assignment->GetAverageScore($user);
        }
        return new Collection($scores);
    }

    public function test(): Schemas\Test{
        $t = new Test($this->Assignment->GetTest());
        $t->SetContext($this->GetContext());
        return $t;
    }

    public function assigned_by_id(): string{
        return $this->Assignment->GetAssigningUser()->GetId();
    }

    // Ilość podejść wykonanych tylko przez bieżącego użytkownika
    public function attempt_count(): int{
        $current_user = $this->GetContext()->GetUser();
        return $this->Assignment->CountUserAttempts($current_user);
    }

    public function attempts(): Schemas\Collection{
        $current_user = $this->GetContext()->GetUser();
        $include_unfinished = $this->GetContext()->GetMethod() != 'GET';
        $attempts = [];
        $out_attempts = [];

        if($current_user->GetId() == $this->Assignment->GetAssigningUser()->GetId()){
            $attempts = \Entities\Attempt::GetAttemptsByAssignment($this->Assignment, $include_unfinished);
        }else{
            $attempts = $this->Assignment->GetUserAttempts($current_user, $include_unfinished);
        }

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
            try{
                if($target instanceof \Auth\Users\User){
                    $all_users[$target->GetId()] = $target;
                }elseif($target instanceof \Auth\Users\Group){
                    $users = $target->GetUsers();
                    foreach($users as $user){
                        $all_users[$user->GetId()] = $user;
                    }
                }
            }catch(\Exception $e){
                
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