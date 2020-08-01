<?php
namespace Api\Resources;

class AssignedToMeCollection extends Resource {

    protected function LazyLoad($data, $test_id){
        $current_user = $this->GetContext()->GetUser();
        $assignments = \Entities\Assignment::GetAssignmentsForUser($current_user);

        foreach($assignments as $assignment){
            $this->AddSubResource($assignment->GetId(), new Assignment($assignment));
        }

        return true;
    }
}
?>