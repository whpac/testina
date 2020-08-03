<?php
namespace Api\Resources;

class AnswerCollection extends Collection {

    public function CreateSubResource(/* mixed */ $source){
        $question = $this->Parent;
        $res = \Entities\Answer::Create($question, $source->text, ['correct' => $source->correct]);

        if(!$res) throw new \Exception('Nie udało się utworzyć odpowiedzi.');
        return null;
    }
}
?>