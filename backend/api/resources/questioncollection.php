<?php
namespace Api\Resources;

class QuestionCollection extends Resource {

    protected function LazyLoad($test, $test_id){
        $questions = $test->GetQuestions();

        foreach($questions as $question){
            $this->AddSubResource($question->GetId(), new Question($question));
        }

        return true;
    }
}
?>