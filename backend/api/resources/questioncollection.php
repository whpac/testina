<?php
namespace Api\Resources;

use Api\Exceptions;

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
        return null;
    }

    public function AssertAccessible(/* undefined yet */ $context){
        $current_user = \UEngine\Modules\Auth\AccessControl\AuthManager::GetCurrentUser();
        $test = $this->GetConstructorArgument();
        if($current_user->GetId() != $test->GetAuthor()->GetId()){
            throw new Exceptions\ResourceInaccessible('questions');
        }
    }
}
?>