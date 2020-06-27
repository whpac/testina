<?php
namespace Api\Resources;

class UserCollection extends Resource {

    protected function LazyLoad($data, $test_id){
        $current_user = \UEngine\Modules\Auth\AccessControl\AuthManager::GetCurrentUser();
        $this->AddSubResource('current', new User($current_user));

        return true;
    }
}
?>