<?php
namespace Api\Resources;

class User extends Resource{

    protected function LazyLoad($user, $name){
        $this->AddSubResource('id', new ValueResource($user->GetId()));
        $this->AddSubResource('name', new ValueResource($user->GetFullName()));

        return true;
    }
}
?>