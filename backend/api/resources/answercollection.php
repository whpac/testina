<?php
namespace Api\Resources;

use Api\Validation\TypeValidator;
use Api\Validation\ValueValidator;

class AnswerCollection extends Collection {

    public function CreateSubResource(/* mixed */ $source){
        TypeValidator::AssertIsObject($source);
        TypeValidator::AssertIsBool($source->correct, 'correct');
        TypeValidator::AssertIsString($source->text, 'text');

        $order = 0;
        if(isset($data->order) && !is_null($data->order)){
            TypeValidator::AssertIsInt($data->order, 'order');
            ValueValidator::AssertIsNonNegative($data->order, 'order');
            $order = $data->order;
        }

        $question = $this->Parent;
        $res = \Entities\Answer::Create($question, $source->text, ['correct' => $source->correct], $order);

        if(!$res) throw new \Exception('Nie udało się utworzyć odpowiedzi.');
        return null;
    }
}
?>