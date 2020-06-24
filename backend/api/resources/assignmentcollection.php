<?php
namespace Api\Resources;

class AssignmentCollection extends Resource {

    protected function LazyLoad($data, $test_id){
        $current_user = \UEngine\Modules\Auth\AccessControl\AuthManager::GetCurrentUser();
        $assignments = \Entities\Assignment::GetAssignmentsForUser($current_user);

        foreach($assignments as $assignment){
            $this->AddSubResource($assignment->GetId(), new Assignment($assignment));
        }

        return true;
    }

    // public function CreateSubResource(/* mixed */ $source, /* undefined yet */ $context){
    //     $current_user = \UEngine\Modules\Auth\AccessControl\AuthManager::GetCurrentUser();
    //     $test = \Entities\Test::Create($current_user, $source->name, $source->time_limit, $source->question_multiplier);

    //     header('Content-Location: '.$test->GetId());
    // }
}
?>