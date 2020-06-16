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
}
?>