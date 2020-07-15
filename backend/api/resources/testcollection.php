<?php
namespace Api\Resources;

class TestCollection extends Resource {

    protected function LazyLoad($data, $test_id){
        $current_user = $this->GetContext()->GetUser();
        $tests = \Entities\Test::GetTestsCreatedByUser($current_user);

        foreach($tests as $test){
            $this->AddSubResource($test->GetId(), new Test($test));
        }

        return true;
    }

    public function CreateSubResource(/* mixed */ $source){
        $current_user = $this->GetContext()->GetUser();
        $test = \Entities\Test::Create($current_user, $source->name, $source->time_limit, $source->question_multiplier);

        header('Content-Location: '.$test->GetId());
        return null;
    }
}
?>