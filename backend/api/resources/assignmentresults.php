<?php
namespace Api\Resources;

use Api\Schemas;

class AssignmentResults extends Resource implements Schemas\AssignmentResults{
    protected $Assignment;
    protected $User;

    public function __construct($assignment, $user){
        parent::__construct($assignment);
        if(is_null($assignment)) throw new \Exception('$assignment nie może być null.');
        if(is_null($user)) throw new \Exception('$user nie może być null.');

        $this->Assignment = $assignment;
        $this->User = $user;
    }

    public function GetKeys(): array{
        $keys = [
            'user_id',
            'attempt_count',
            'last_attempt',
            'average_score'
        ];

        return $keys;
    }

    public function user_id(): int{
        return $this->User->GetId();
    }

    public function attempt_count(): int{
        return $this->Assignment->CountUserAttempts($this->User);
    }

    public function last_attempt(): ?\DateTime{
        $attempt = $this->Assignment->GetUsersLastAttempt($this->User);
        if(is_null($attempt)) return null;
        return $attempt->GetBeginTime();
    }

    public function average_score(): ?int{
        return $this->Assignment->GetAverageScore($this->User);
    }
}
?>