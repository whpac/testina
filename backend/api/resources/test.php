<?php
namespace Api\Resources;

use Api\Schemas;
use Api\Validation\TypeValidator;

class Test extends Resource implements Schemas\Test{
    protected $Test;

    public function Update(/* mixed */ $data){
        TypeValidator::AssertIsObject($data);
        TypeValidator::AssertIsString($data->name, 'name');
        TypeValidator::AssertIsNumeric($data->question_multiplier, 'question_multiplier');
        TypeValidator::AssertIsInt($data->time_limit, 'time_limit');

        $res = $this->Test->Update($data->name, $data->question_multiplier, $data->time_limit);

        if(!$res) throw new \Exception('Nie udało się zaktualizować testu.');
    }

    public function Delete($source){
        $this->Test->Remove();
    }

    public function __construct($test){
        parent::__construct();

        if(is_null($test)) throw new \Exception('$test nie może być null');
        $this->Test = $test;
    }

    public function GetKeys(): array{
        $keys = [
            'id',
            'name',
            'author_id',
            'creation_date',
            'time_limit',
            'question_multiplier',
            'question_count'
        ];

        if($this->Test->GetAuthor()->GetId() == $this->GetContext()->GetUser()->GetId()){
            $keys[] = 'questions';
            $keys[] = 'assignment_count';
            $keys[] = 'assignment_ids';
        }

        return $keys;
    }

    public function id(): int{
        return $this->Test->GetId();
    }

    public function name(): string{
        return $this->Test->GetName();
    }

    public function author_id(): int{
        return $this->Test->GetAuthor()->GetId();
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

    public function question_count(): int{
        return count($this->Test->GetQuestions());
    }

    public function questions(): ?Schemas\Collection{
        if($this->Test->GetAuthor()->GetId() != $this->GetContext()->GetUser()->GetId()) return null;

        $questions = $this->Test->GetQuestions();
        $out_questions = [];

        foreach($questions as $question){
            $out_questions[$question->GetId()] = new Question($question);;
        }

        $collection = new QuestionCollection($out_questions, $this->Test);
        $collection->SetContext($this->GetContext());
        return $collection;
    }

    public function assignment_count(): ?int{
        if($this->Test->GetAuthor()->GetId() != $this->GetContext()->GetUser()->GetId()) return null;
        return $this->Test->GetAssignmentCount();
    }

    public function assignment_ids(): ?array{
        if($this->Test->GetAuthor()->GetId() != $this->GetContext()->GetUser()->GetId()) return null;

        $assignments = $this->Test->GetAssignments();
        $out_assignments = [];

        foreach($assignments as $assignment){
            $out_assignments[] = $assignment->GetId();
        }

        return $out_assignments;
    }
}
?>