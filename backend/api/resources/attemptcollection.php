<?php
namespace Api\Resources;

class AttemptCollection extends Resource {

    protected function LazyLoad($assignment, $name){
        $current_user = $this->GetContext()->GetUser();
        $attempts = $assignment->GetUserAttempts($current_user);

        foreach($attempts as $attempt){
            $this->AddSubResource($attempt->GetId(), new Attempt($attempt));
        }

        return true;
    }

    public function CreateSubResource(/* mixed */ $source){
        $assignment = $this->GetConstructorArgument();

        $new_attempt = new AttemptWithTest($assignment);
        $new_attempt->SetContext($this->GetContext());
        return $new_attempt;
    }
}
?>