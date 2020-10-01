<?php
namespace Api\Resources;

use Api\Validation\TypeValidator;
use Api\Validation\ValueValidator;

class TestCollection extends Collection {

    public function CreateSubResource(/* mixed */ $source){
        TypeValidator::AssertIsObject($source);
        TypeValidator::AssertIsString($source->name, 'name');
        TypeValidator::AssertIsNumeric($source->question_multiplier, 'question_multiplier');
        TypeValidator::AssertIsInt($source->time_limit, 'time_limit');
        ValueValidator::AssertIsNonNegative($source->question_multiplier, 'question_multiplier');
        ValueValidator::AssertIsNonNegative($source->time_limit, 'time_limit');

        $type = null;
        if(isset($data->type)){
            TypeValidator::AssertIsInt($data->type, 'type');
            ValueValidator::AssertIsInRange($data->type, 0, 1, 'type');
            $type = $data->type;
        }
        $score_counting = null;
        if(isset($data->score_counting)){
            TypeValidator::AssertIsInt($data->score_counting, 'score_counting');
            ValueValidator::AssertIsInRange($data->score_counting, 0, 1, 'score_counting');
            $score_counting = $data->score_counting;
        }

        $current_user = $this->GetContext()->GetUser();
        $test = \Entities\Test::Create($current_user, $source->name, $source->time_limit, $source->question_multiplier, $type, $score_counting);

        header('Content-Location: '.$test->GetId());
        return null;
    }
}
?>