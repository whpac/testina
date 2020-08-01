<?php
namespace Api\Resources;

use Api\Exceptions;

class QuestionCollection extends Resource {

    protected function LazyLoad($test, $test_id){
        if(is_array($test)) $questions = $test;
        else $questions = $test->GetQuestions();

        foreach($questions as $question){
            $this->AddSubResource($question->GetId(), new Question($question));
        }

        return true;
    }

    public function CreateSubResource(/* mixed */ $source){
        $test = $this->GetConstructorArgument();
        if(is_array($test)) throw new Exceptions\MethodNotAllowed('POST');

        $question = \Entities\Question::Create(
            $test,
            $source->text,
            $source->type,
            $source->points,
            $source->points_counting,
            $source->max_typos
        );

        header('Content-Location: '.$question->GetId());
        return null;
    }

    public function AssertAccessible(){
        $current_user = $this->GetContext()->GetUser();
        $test = $this->GetConstructorArgument();

        // If the collection is created from Question[], assume it's accessible
        if(!is_array($test)){
            if($current_user->GetId() != $test->GetAuthor()->GetId()){
                throw new Exceptions\ResourceInaccessible('questions');
            }
        }
    }
}
?>