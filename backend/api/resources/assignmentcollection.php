<?php
namespace Api\Resources;

class AssignmentCollection extends Collection {

    public function CreateSubResource(/* mixed */ $source){
        $current_user = $this->GetContext()->GetUser();
        $test = new \Entities\Test($source->test_id);

        if($test->GetAuthor()->GetId() != $current_user->GetId())
            throw new Exceptions\MethodNotAllowed('POST');

        $attempt_limit = $source->attempt_limit;
        $deadline = new \DateTime($source->time_limit);

        $assignment = \Entities\Assignment::Create($current_user, $test, $attempt_limit, $deadline);

        header('Content-Location: '.$assignment->GetId());
        return null;
    }
}
?>