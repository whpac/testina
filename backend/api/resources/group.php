<?php
namespace Api\Resources;

class Group extends Resource{

    protected function LazyLoad($group, $name){
        $this->AddSubResource('id', new ValueResource($group->GetId()));
        $this->AddSubResource('name', new ValueResource($group->GetName()));
        return true;
    }
}
?>