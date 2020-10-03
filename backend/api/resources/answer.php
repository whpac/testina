<?php
namespace Api\Resources;

use Api\Schemas;
use Api\Validation\TypeValidator;
use Api\Validation\ValueValidator;

class Answer extends Resource implements Schemas\Answer{
    protected $Answer;

    public function Update(/* mixed */ $data){
        TypeValidator::AssertIsObject($data);
        TypeValidator::AssertIsBool($data->correct, 'correct');
        TypeValidator::AssertIsString($data->text, 'text');

        $order = 0;
        if(isset($data->order) && !is_null($data->order)){
            TypeValidator::AssertIsInt($data->order, 'order');
            ValueValidator::AssertIsNonNegative($data->order, 'order');
            $order = $data->order;
        }

        $res = $this->Answer->Update($data->text, [\Entities\Answer::FLAG_CORRECT => $data->correct], $order);

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
            'correct',
            'order'
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

    public function order(): int{
        return $this->Answer->GetOrder();
    }
}
?>