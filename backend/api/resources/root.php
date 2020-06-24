<?php
namespace Api\Resources;

class Root extends Resource {

    protected function LazyLoad($data, $name){
        $this->AddSubResource('assignments', new AssignmentCollection());
        $this->AddSubResource('tests', new TestCollection());
        return true;
    }
}
?>