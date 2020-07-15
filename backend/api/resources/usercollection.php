<?php
namespace Api\Resources;

class UserCollection extends Resource {

    protected function LazyLoad($data, $test_id){
        $current_user = $this->GetContext()->GetUser();
        $this->AddSubResource('current', new User($current_user));

        return true;
    }
}
?>