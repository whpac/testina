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
        $current_user = $this->GetContext()->GetUser();
        $assignment = $this->GetConstructorArgument();

        return new AttemptWithTest([$assignment, $current_user]);
    }
}
?>