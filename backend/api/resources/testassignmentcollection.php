<?php
namespace Api\Resources;

use Api\Exceptions;

class TestAssignmentCollection extends Resource {

    protected function LazyLoad($data, $test_id){
        $test = $this->GetConstructorArgument();
        $assignments = $test->GetAssignments();

        foreach($assignments as $assignment){
            $this->AddSubResource($assignment->GetId(), new Assignment($assignment));
        }

        return true;
    }

    public function AssertAccessible(){
        $test = $this->GetConstructorArgument();
        if($test->GetAuthor()->GetId() != $this->GetContext()->GetUser()->GetId())
            throw new Exceptions\ResourceInaccessible('assignments');
    }
}
?>