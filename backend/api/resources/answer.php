<?php
namespace Api\Resources;

use Api\Schemas;
use Api\Validation\TypeValidator;

class Answer extends Resource implements Schemas\Answer{
    protected $Answer;

    public function Update(/* mixed */ $data){
        TypeValidator::AssertIsObject($data);
        TypeValidator::AssertIsBool($data->correct, 'correct');
        TypeValidator::AssertIsString($data->text, 'text');

        $res = $this->Answer->Update($data->text, ['correct' => $data->correct]);

        if(!$res) throw new \Exception('Nie udało się zaktualizować odpowiedzi');
    }

    public function Delete($source){
        $res = $this->Answer->Remove();

        if(!$res) throw new \Exception('Nie udało się usunąć odpowiedzi');
    }

    public function __construct($answer){
        parent::__construct();

        if(is_null($answer)) throw new \Exception('$answer nie może być null.');
        $this->Answer = $answer;
    }

    public function GetKeys(): array{
        return [
            'id',
            'text',
            'correct'
        ];
    }

    public function id(): int{
        return $this->Answer->GetId();
    }

    public function text(): string{
        return $this->Answer->GetText();
    }

    public function correct(): bool{
        return $this->Answer->IsCorrect();
    }
}
?>