<?php
namespace Api\Resources;

class GroupCollection extends Resource {

    protected function LazyLoad($data, $test_id){
        $groups = \Entities\Group::GetAll();

        foreach($groups as $group){
            $this->AddSubResource($group->GetId(), new Group($group));
        }

        return true;
    }
}
?>