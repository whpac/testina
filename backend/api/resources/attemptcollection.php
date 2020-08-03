<?php
namespace Api\Resources;

class AttemptCollection extends Collection {

    public function CreateSubResource(/* mixed */ $source){
        $assignment = $this->Parent;

        $new_attempt = new AttemptWithTest($assignment);
        $new_attempt->SetContext($this->GetContext());
        return $new_attempt;
    }
}
?>