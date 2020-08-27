<?php
namespace Api\Resources;

use Api\Validation\TypeValidator;

class TestCollection extends Collection {

    public function CreateSubResource(/* mixed */ $source){
        TypeValidator::AssertIsObject($source);
        TypeValidator::AssertIsString($source->name, 'name');
        TypeValidator::AssertIsNumeric($source->question_multiplier, 'question_multiplier');
        TypeValidator::AssertIsInt($source->time_limit, 'time_limit');

        $current_user = $this->GetContext()->GetUser();
        $test = \Entities\Test::Create($current_user, $source->name, $source->time_limit, $source->question_multiplier);

        header('Content-Location: '.$test->GetId());
        return null;
    }
}
?>