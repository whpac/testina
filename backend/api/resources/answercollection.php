<?php
namespace Api\Resources;

class AnswerCollection extends Resource {

    protected function LazyLoad($question, $test_id){
        $answers = $question->GetAnswers();

        foreach($answers as $answer){
            $this->AddSubResource($answer->GetId(), new Answer($answer));
        }

        return true;
    }

    public function CreateSubResource(/* mixed */ $source, /* undefined yet */ $context){
        $question = $this->GetConstructorArgument();
        $res = \Entities\Answer::Create($question, $source->text, ['correct' => $source->correct]);

        if(!$res) throw new \Exception('Nie udało się utworzyć odpowiedzi.');
        return null;
    }
}
?>