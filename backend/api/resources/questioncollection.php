<?php
namespace Api\Resources;

use Api\Exceptions;
use Api\Validation\TypeValidator;
use Api\Validation\ValueValidator;

class QuestionCollection extends Collection {

    public function CreateSubResource(/* mixed */ $source){
        TypeValidator::AssertIsObject($source);
        TypeValidator::AssertIsInt($source->max_typos, 'max_typos');
        TypeValidator::AssertIsNumeric($source->points, 'points');
        TypeValidator::AssertIsInt($source->points_counting, 'points_counting');
        TypeValidator::AssertIsString($source->text, 'text');
        TypeValidator::AssertIsInt($source->type, 'type');
        ValueValidator::AssertIsNonNegative($source->max_typos, 'max_typos');
        ValueValidator::AssertIsNonNegative($source->points, 'points');
        ValueValidator::AssertIsInRange($source->points_counting, 0, 2, 'points_counting');
        ValueValidator::AssertIsInRange($source->type, 0, 2, 'type');

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