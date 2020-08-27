<?php
namespace Api\Resources;

use Api\Schemas;
use Api\Validation\TypeValidator;
use Api\Validation\ValueValidator;

class Question extends Resource implements Schemas\Question{
    protected $Question;

    public function Update(/* mixed */ $data){
        TypeValidator::AssertIsObject($data);
        TypeValidator::AssertIsInt($data->max_typos, 'max_typos');
        TypeValidator::AssertIsNumeric($data->points, 'points');
        TypeValidator::AssertIsInt($data->points_counting, 'points_counting');
        TypeValidator::AssertIsString($data->text, 'text');
        TypeValidator::AssertIsInt($data->type, 'type');
        ValueValidator::AssertIsNonNegative($data->max_typos, 'max_typos');
        ValueValidator::AssertIsNonNegative($data->points, 'points');
        ValueValidator::AssertIsInRange($data->points_counting, 0, 2, 'points_counting');
        ValueValidator::AssertIsInRange($data->type, 0, 2, 'type');

        $res = $this->Question->Update($data->text, $data->type, $data->points, $data->points_counting, $data->max_typos);

        if(!$res) throw new \Exception('Nie udało się zaktualizować pytania.');
    }

    public function Delete($source){
        $res = $this->Question->Remove();

        if(!$res) throw new \Exception('Nie udało się usunąć pytania.');
    }

    public function __construct($question){
        parent::__construct();

        if(is_null($question)) throw new \Exception('$question nie może być null.');
        $this->Question = $question;
    }

    public function GetKeys(): array{
        return [
            'id',
            'text',
            'type',
            'points',
            'points_counting',
            'max_typos',
            'answer_count',
            'answers'
        ];
    }

    public function id(): int{
        return $this->Question->GetId();
    }

    public function text(): string{
        return $this->Question->GetText();
    }

    public function type(): int{
        return $this->Question->GetType();
    }

    public function points(): float{
        return $this->Question->GetPoints();
    }

    public function points_counting(): int{
        return $this->Question->GetPointsCounting();
    }

    public function max_typos(): int{
        return $this->Question->GetMaxNumberOfTypos();
    }

    public function answer_count(): int{
        return count($this->Question->GetAnswers());
    }

    public function answers(): Schemas\Collection{
        $answers = $this->Question->GetAnswers();
        $out_answers = [];

        foreach($answers as $answer){
            $out_answers[$answer->GetId()] = new Answer($answer);
        }

        $collection = new AnswerCollection($out_answers, $this->Question);
        $collection->SetContext($this->GetContext());
        return $collection;
    }
}
?>