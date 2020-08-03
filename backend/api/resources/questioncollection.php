<?php
namespace Api\Resources;

use Api\Exceptions;

class QuestionCollection extends Collection {

    public function CreateSubResource(/* mixed */ $source){
        $test = $this->Parent;
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
}
?>