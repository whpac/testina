<?php
namespace Api\Resources;

class AttemptCollection extends Resource {

    protected function LazyLoad($assignment, $name){
        $current_user = \UEngine\Modules\Auth\AccessControl\AuthManager::GetCurrentUser();
        $attempts = $assignment->GetUserAttempts($current_user);

        foreach($attempts as $attempt){
            $this->AddSubResource($attempt->GetId(), new Attempt($attempt));
        }

        return true;
    }

    public function CreateSubResource(/* mixed */ $source, /* undefined yet */ $context){
        $current_user = \UEngine\Modules\Auth\AccessControl\AuthManager::GetCurrentUser();
        $assignment = $this->GetConstructorArgument();

        return new AttemptWithTest([$assignment, $current_user]);
    }
}
?>