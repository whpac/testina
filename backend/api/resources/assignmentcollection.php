<?php
namespace Api\Resources;

use Api\Validation\TypeValidator;

class AssignmentCollection extends Collection {

    public function GetKeys(): array{
        if($this->Filters == []) return array_keys($this->Items);
        if(in_array('to_me', $this->Filters)){
            $assigned_to_me_ids = [];
            $current_user = $this->GetContext()->GetUser();

            $assignments = \Entities\Assignment::GetAssignmentsForUser($current_user);

            foreach($assignments as $assignment){
                $assigned_to_me_ids[] = $assignment->GetId();
            }

            return array_intersect(array_keys($this->Items), $assigned_to_me_ids);
        }

        return array_intersect(array_keys($this->Items), $this->Filters);
    }

    public function CreateSubResource(/* mixed */ $source){
        TypeValidator::AssertIsObject($source);
        TypeValidator::AssertIsInt($source->attempt_limit, 'attempt_limit');
        TypeValidator::AssertIsInt($source->test_id, 'test_id');
        TypeValidator::AssertIsDateTimeString($source->time_limit, 'time_limit');

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