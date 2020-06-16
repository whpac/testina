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
}
?>