<?php
namespace Api\Resources;

use Api\Schemas;

class Answer extends Resource implements Schemas\Answer{
    protected $Answer;

    protected function LazyLoad($answer, $name){
        /*$this->AddSubResource('id', new ValueResource($answer->GetId()));
        $this->AddSubResource('text', new ValueResource($answer->GetText()));
        $this->AddSubResource('correct', new ValueResource($answer->IsCorrect()));

        return true;*/
    }

    public function Update(/* mixed */ $data){
        $answer = $this->GetConstructorArgument();
        $res = $answer->Update($data->text, ['correct' => $data->correct]);

        if(!$res) throw new \Exception('Nie udało się zaktualizować odpowiedzi');
    }

    public function Delete(){
        $answer = $this->GetConstructorArgument();
        $res = $answer->Remove();

        if(!$res) throw new \Exception('Nie udało się usunąć odpowiedzi');
    }

    public function __construct($answer){
        parent::__construct($answer);
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