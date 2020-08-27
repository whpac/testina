<?php
namespace Api\Resources;

use Api\Validation\TypeValidator;

class AnswerCollection extends Collection {

    public function CreateSubResource(/* mixed */ $source){
        TypeValidator::AssertIsObject($source);
        TypeValidator::AssertIsBool($source->correct, 'correct');
        TypeValidator::AssertIsString($source->text, 'text');

        $question = $this->Parent;
        $res = \Entities\Answer::Create($question, $source->text, ['correct' => $source->correct]);

        if(!$res) throw new \Exception('Nie udało się utworzyć odpowiedzi.');
        return null;
    }
}
?>