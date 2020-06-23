<?php
namespace Api\Resources;

class TestCollection extends Resource {

    protected function LazyLoad($data, $test_id){
        $current_user = \UEngine\Modules\Auth\AccessControl\AuthManager::GetCurrentUser();
        $tests = \Entities\Test::GetTestsCreatedByUser($current_user);

        foreach($tests as $test){
            $this->AddSubResource($test->GetId(), new Test($test));
        }

        return true;
    }

    public function CreateSubResource(/* mixed */ $source, /* undefined yet */ $context){
        $current_user = \UEngine\Modules\Auth\AccessControl\AuthManager::GetCurrentUser();
        $test = \Entities\Test::Create($current_user, $source->name, $source->time_limit, $source->question_multiplier);

        header('Content-Location: '.$test->GetId());
    }
}
?>