<?php
namespace Api\Resources;

use Api\Exceptions;
use Api\Validation\TypeValidator;

class QuestionCollection extends Collection {

    public function CreateSubResource(/* mixed */ $source){
        TypeValidator::AssertIsObject($source);
        TypeValidator::AssertIsString($source->text, 'text');
        TypeValidator::AssertIsInt($source->type, 'type');
        TypeValidator::AssertIsNumeric($source->points, 'points');
        TypeValidator::AssertIsInt($source->points_counting, 'points_counting');
        TypeValidator::AssertIsInt($source->max_typos, 'max_typos');

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