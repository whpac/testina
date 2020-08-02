<?php
namespace Api\Resources;

use Api\Exceptions;
use Api\Schemas;

class AttemptWithTest extends Resource implements Schemas\Attempt {
    protected $Attempt;
    protected $Questions;
    protected $Path;

    protected function LazyLoad($assignment, $name){
        /*$current_user = $this->GetContext()->GetUser();

        if(!$assignment->AreRemainingAttempts($current_user)){
            throw new Exceptions\BadRequest('Wykorzystał'.($current_user->IsFemale() ? 'a' : 'e').'ś już wszystkie podejścia.');
        }

        if($assignment->HasTimeLimitExceeded()){
            throw new Exceptions\BadRequest('Termin rozwiązania tego testu upłynął.');
        }

        $test = $assignment->GetTest();
        $questions = $test->GetQuestions();
        $q_count = $test->GetQuestionCount(); // Multiplier is taken into account

        $path = [];
        $points = [];
        while(count($path) < $q_count){
            foreach($questions as $question){
                $path[] = $question->GetId();
                $points[$question->GetId()] = $question->GetPoints();
            }
        }
        shuffle($path);
        $path = array_slice($path, 0, $q_count); // Drop the excess questions

        $max_score = 0;
        foreach($path as $q_id){
            $max_score += $points[$q_id];
        }

        $attempt = \Entities\Attempt::Create($current_user, $assignment, null, 0, $max_score);

        $this->AddSubResource('id', new ValueResource($attempt->GetId()));
        $this->AddSubResource('user', new User($attempt->GetUser()));
        $this->AddSubResource('max_score', new ValueResource($max_score));
        $this->AddSubResource('begin_time', new ValueResource($attempt->GetBeginTime()->format('Y-m-d H:i:s')));
        $this->AddSubResource('questions', new QuestionCollection($questions));
        $this->AddSubResource('path', new ValueResource($path));

        return true;*/
    }

    public function __construct($assignment){
        parent::__construct($assignment);
        if(is_null($assignment)) throw new \Exception('$assignment nie może być null.');

        $current_user = $this->GetContext()->GetUser();

        if(!$assignment->AreRemainingAttempts($current_user)){
            throw new Exceptions\BadRequest('Wykorzystał'.($current_user->IsFemale() ? 'a' : 'e').'ś już wszystkie podejścia.');
        }

        if($assignment->HasTimeLimitExceeded()){
            throw new Exceptions\BadRequest('Termin rozwiązania tego testu upłynął.');
        }

        $test = $assignment->GetTest();
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

        $this->Attempt = \Entities\Attempt::Create($current_user, $assignment, null, 0, $max_score);
    }

    public function GetKeys(): array{
        return [
            'id',
            'user',
            'max_score',
            'begin_time',
            'questions',
            'path'
        ];
    }

    public function id(): int{
        return $this->Attempt->GetId();
    }

    public function user(): Schemas\User{
        $u = new User($this->Attempt->GetUser());
        $u->SetContext($this->GetContext());
        return $u;
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

    public function questions(): ?array{
        $out_questions = [];

        foreach($this->Questions as $question){
            $q = new Question($question);
            $q->SetContext($this->GetContext());
            $out_questions[$question->GetId()] = $q;
        }

        return $out_questions;
    }

    public function path(): ?array{
        return $this->Path;
    }

    public function answers(){

    }
}
?>