<?php
namespace Api\Resources;

use Api\Schemas;

class Test extends Resource implements Schemas\Test{
    protected $Test;

    protected function LazyLoad($data, $name){
        /*$test = $this->GetConstructorArgument();

        $this->AddSubResource('id', new ValueResource($test->GetId()));
        $this->AddSubResource('name', new ValueResource($test->GetName()));
        $this->AddSubResource('author', new User($test->GetAuthor()));
        $this->AddSubResource('creation_date', new ValueResource($test->GetCreationDate()->format('Y-m-d H:i:s')));
        $this->AddSubResource('time_limit', new ValueResource($test->GetTimeLimit()));
        $this->AddSubResource('question_multiplier', new ValueResource($test->GetQuestionMultiplier()));
        $this->AddSubResource('question_count', new ValueResource(count($test->GetQuestions())));

        if($test->GetAuthor()->GetId() == $this->GetContext()->GetUser()->GetId()){
            $this->AddSubResource('assignment_count', new ValueResource($test->GetAssignmentCount()));
            $this->AddSubResource('assignments', new TestAssignmentCollection($test));
        }
        
        $this->AddSubResource('questions', new QuestionCollection($test));
        return true;*/
    }

    public function Update(/* mixed */ $data){
        $test = $this->GetConstructorArgument();
        $res = $test->Update($data->name, $data->question_multiplier, $data->time_limit);

        if(!$res) throw new \Exception('Nie udało się zaktualizować testu.');
    }

    public function Delete(){
        $test = $this->GetConstructorArgument();
        $test->Remove();
    }

    public function __construct($test){
        parent::__construct($test);
        if(is_null($test)) throw new \Exception('$test nie może być null');
        $this->Test = $test;
    }

    public function GetKeys(): array{
        $keys = [
            'id',
            'name',
            'author',
            'creation_date',
            'time_limit',
            'question_multiplier'
        ];

        if($this->Test->GetAuthor()->GetId() == $this->GetContext()->GetUser()->GetId()){
            $keys[] = 'question_count';
            $keys[] = 'questions';
            $keys[] = 'assignment_count';
            $keys[] = 'assignments';
        }

        return $keys;
    }

    public function id(): int{
        return $this->Test->GetId();
    }

    public function name(): string{
        return $this->Test->GetName();
    }

    public function author(): Schemas\User{
        $u = new User($this->Test->GetAuthor());
        $u->SetContext($this->GetContext());
        return $u;
    }

    public function creation_date(): \DateTime{
        return $this->Test->GetCreationDate();
    }

    public function time_limit(): int{
        return $this->Test->GetTimeLimit();
    }

    public function question_multiplier(): float{
        return $this->Test->GetQuestionMultiplier();
    }

    public function question_count(): ?int{
        if($this->Test->GetAuthor()->GetId() != $this->GetContext()->GetUser()->GetId()) return null;
        return count($this->Test->GetQuestions());
    }

    public function questions(): ?array{
        if($this->Test->GetAuthor()->GetId() != $this->GetContext()->GetUser()->GetId()) return null;

        $questions = $this->Test->GetQuestions();
        $out_questions = [];

        foreach($questions as $question){
            $q = new Question($question);
            $q->SetContext($this->GetContext());
            $out_questions[$question->GetId()] = $q;
        }

        return $out_questions;
    }

    public function assignment_count(): ?int{
        if($this->Test->GetAuthor()->GetId() != $this->GetContext()->GetUser()->GetId()) return null;
        return $this->Test->GetAssignmentCount();
    }

    public function assignments(): ?array{
        if($this->Test->GetAuthor()->GetId() != $this->GetContext()->GetUser()->GetId()) return null;

        $assignments = $this->Test->GetAssignments();
        $out_assignments = [];

        foreach($assignments as $assignment){
            $a = new Assignment($assignment);
            $a->SetContext($this->GetContext());
            $out_assignments[$assignment->GetId()] = $a;
        }

        return $out_assignments;
    }
}
?>