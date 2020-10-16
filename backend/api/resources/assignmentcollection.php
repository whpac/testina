<?php
namespace Api\Resources;

use Api\Validation\TypeValidator;
use Api\Validation\ValueValidator;

class AssignmentCollection extends Collection {
    protected $LinkAssignments;

    public function __construct($items, $parent = null, $link_assignments = []){
        parent::__construct($items, $parent);

        $this->LinkAssignments = $link_assignments;
    }

    public function GetKeys(): array{
        $keys = array_keys($this->Items);
        if(!is_array($this->Filters)) return $keys;

        if(in_array('to_me', $this->Filters)){
            $assigned_to_me_ids = [];
            $current_user = $this->GetContext()->GetUser();

            $assignments = \Entities\Assignment::GetAssignmentsForUser($current_user);

            foreach($assignments as $assignment){
                $assigned_to_me_ids[] = $assignment->GetId();
            }

            $keys = array_intersect($keys, $assigned_to_me_ids);
        }

        if(in_array('tests_only', $this->Filters)){
            foreach($keys as $i => $key){
                if((new \Entities\Assignment($key))->GetTest()->GetType() != \Entities\Test::TYPE_TEST){
                    unset($keys[$i]);
                }
            }
        }

        if(in_array('surveys_only', $this->Filters)){
            foreach($keys as $i => $key){
                if((new \Entities\Assignment($key))->GetTest()->GetType() != \Entities\Test::TYPE_SURVEY){
                    unset($keys[$i]);
                }
            }
        }

        return $keys;
    }

    public function KeyExists($key_name): bool{
        if(array_key_exists($key_name, $this->Items)) return true;
        if(array_key_exists($key_name, $this->LinkAssignments)) return true;
        return false;
    }

    public function __call($name, $args){
        if(isset($this->Items[$name])){
            $item = $this->Items[$name];
            $item->SetContext($this->GetContext());
            return $item;
        }

        if(isset($this->LinkAssignments[$name])){
            $item = $this->LinkAssignments[$name];
            $item->SetContext($this->GetContext());
            return $item;
        }

        throw new \BadMethodCallException('Indeks '.urlencode($name).' nie istnieje w tej kolekcji.');
    }

    public function CreateSubResource(/* mixed */ $source){
        TypeValidator::AssertIsObject($source);
        TypeValidator::AssertIsInt($source->attempt_limit, 'attempt_limit');
        TypeValidator::AssertIsInt($source->test_id, 'test_id');
        TypeValidator::AssertIsDateTimeString($source->time_limit, 'time_limit');
        ValueValidator::AssertIsNonNegative($source->attempt_limit, 'attempt_limit');
        ValueValidator::AssertIsNonNegative($source->test_id, 'test_id');

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