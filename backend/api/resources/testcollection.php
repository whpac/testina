<?php
namespace Api\Resources;

class TestCollection extends Collection {

    public function CreateSubResource(/* mixed */ $source){
        $current_user = $this->GetContext()->GetUser();
        $test = \Entities\Test::Create($current_user, $source->name, $source->time_limit, $source->question_multiplier);

        header('Content-Location: '.$test->GetId());
        return null;
    }
}
?>