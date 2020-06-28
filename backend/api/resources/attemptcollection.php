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
}
?>