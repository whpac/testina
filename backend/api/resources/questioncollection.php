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

        $footer = '';
        if(isset($source->footer) && !is_null($source->footer)){
            TypeValidator::AssertIsString($source->footer, 'footer');
            $footer = $source->footer;
        }
        $order = 0;
        if(isset($source->order) && !is_null($source->order)){
            TypeValidator::AssertIsInt($source->order, 'order');
            ValueValidator::AssertIsNonNegative($source->order, 'order');
            $order = $source->order;
        }

        $flags = [];
        if(isset($data->is_optional) && !is_null($data->is_optional)){
            TypeValidator::AssertIsBool($data->is_optional, 'is_optional');
            $flags['optional'] = $data->is_optional;
        }
        if(isset($data->has_na) && !is_null($data->has_na)){
            TypeValidator::AssertIsBool($data->has_na, 'has_na');
            $flags['non-applicable'] = $data->has_na;
        }
        if(isset($data->has_other) && !is_null($data->has_other)){
            TypeValidator::AssertIsBool($data->has_other, 'has_other');
            $flags['other'] = $data->has_other;
        }


        $test = $this->Parent;
        if(is_array($test)) throw new Exceptions\MethodNotAllowed('POST');

        $question = \Entities\Question::Create(
            $test,
            $source->text,
            $source->type,
            $source->points,
            $source->points_counting,
            $source->max_typos,
            $footer,
            $order,
            $flags
        );

        header('Content-Location: '.$question->GetId());
        return null;
    }
}
?>