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

        $type = 0;
        if(isset($source->type)){
            TypeValidator::AssertIsInt($source->type, 'type');
            ValueValidator::AssertIsInRange($source->type, 0, 1, 'type');
            $type = $source->type;
        }
        $score_counting = 0;
        if(isset($source->score_counting)){
            TypeValidator::AssertIsInt($source->score_counting, 'score_counting');
            ValueValidator::AssertIsInRange($source->score_counting, 0, 1, 'score_counting');
            $score_counting = $dasourceta->score_counting;
        }
        $final_title = '';
        if(isset($source->final_title)){
            TypeValidator::AssertIsString($source->final_title, 'final_title');
            $final_title = $source->final_title;
        }
        $final_text = '';
        if(isset($source->final_text)){
            TypeValidator::AssertIsString($source->final_text, 'final_text');
            $final_text = $source->final_text;
        }

        $current_user = $this->GetContext()->GetUser();
        $test = \Entities\Test::Create($current_user, $source->name, $source->time_limit, $source->question_multiplier, $type, $score_counting, $final_title, $final_text);

        header('Content-Location: '.$test->GetId());
        return null;
    }
}
?>