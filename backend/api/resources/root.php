<?php
namespace Api\Resources;

class Root extends Resource {

    protected function LazyLoad($data, $name){
        $this->AddSubResource('assigned_to_me', new AssignedToMeCollection());
        $this->AddSubResource('assignments', new AssignmentCollection());
        $this->AddSubResource('groups', new GroupCollection());
        $this->AddSubResource('tests', new TestCollection());
        $this->AddSubResource('users', new UserCollection());
        return true;
    }
}
?>