<?php
namespace Api\Resources;

use Api\Exceptions;
use Api\Schemas;

class AttemptWithTest extends Resource implements Schemas\Attempt {
    protected $Attempt;
    protected $Assignment;
    protected $Questions;
    protected $Path;

    public function __construct($assignment){
        parent::__construct();

        if(is_null($assignment)) throw new \Exception('$assignment nie może być null.');
        $this->Assignment = $assignment;
        $this->Attempt = null;
    }

    public function GetKeys(): array{
        if(is_null($this->Attempt)){
            $current_user = $this->GetContext()->GetUser();

            if(!$this->Assignment->AreRemainingAttempts($current_user)){
                throw new Exceptions\BadRequest('Wykorzystał'.($current_user->IsFemale() ? 'a' : 'e').'ś już wszystkie podejścia.');
            }

            if($this->Assignment->HasTimeLimitExceeded()){
                throw new Exceptions\BadRequest('Termin rozwiązania tego testu upłynął.');
            }

            $test = $this->Assignment->GetTest();
            $this->Questions = $test->GetQuestions();
            $q_count = $test->GetQuestionCount(); // Multiplier is taken into account

            $this->Path = [];
            $points = [];
            while(count($this->Path) < $q_count){
                foreach($this->Questions as $question){
                    $this->Path[] = $question->GetId();
                    $points[$question->GetId()] = $question->GetPoints();
                }
            }
            shuffle($this->Path);
            $this->Path = array_slice($this->Path, 0, $q_count); // Drop the excess questions

            $max_score = 0;
            foreach($this->Path as $q_id){
                $max_score += $points[$q_id];
            }

            $this->Attempt = \Entities\Attempt::Create($current_user, $this->Assignment, null, 0, $max_score);
        }

        return [
            'id',
            'user_id',
            'max_score',
            'begin_time',
            'questions',
            'path'
        ];
    }

    public function id(): int{
        return $this->Attempt->GetId();
    }

    public function user_id(): string{
        return $this->Attempt->GetUser()->GetId();
    }

    public function score(): ?float{
        return null;
    }

    public function max_score(): float{
        return $this->Attempt->GetMaxScore();
    }

    public function begin_time(): \DateTime{
        return $this->Attempt->GetBeginTime();
    }

    public function questions(): ?Schemas\Collection{
        $out_questions = [];

        foreach($this->Questions as $question){
            $out_questions[$question->GetId()] = new Question($question);
        }

        $collection = new Collection($out_questions);
        $collection->SetContext($this->GetContext());
        return $collection;
    }

    public function path(): ?array{
        return $this->Path;
    }

    public function answers(){
        return null;
    }
}
?>