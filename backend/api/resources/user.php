<?php
namespace Api\Resources;

class User extends Resource{

    protected function LazyLoad($user, $name){
        $this->AddSubResource('id', new ValueResource($user->GetId()));
        $this->AddSubResource('first_name', new ValueResource($user->GetFirstName()));
        $this->AddSubResource('last_name', new ValueResource($user->GetLastName()));

        return true;
    }
}
?>