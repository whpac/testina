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

    public function CreateSubResource(/* mixed */ $source, /* undefined yet */ $context){
        $test = $this->GetConstructorArgument();
        $question = \Entities\Question::Create(
            $test,
            $source->text,
            $source->type,
            $source->points,
            $source->points_counting,
            $source->max_typos
        );

        header('Content-Location: '.$question->GetId());
    }
}
?>