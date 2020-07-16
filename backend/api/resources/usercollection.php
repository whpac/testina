<?php
namespace Api\Resources;

use Api\Exceptions;

class UserCollection extends Resource {

    protected function LazyLoad($data, $user_id){
        $context = $this->GetContext();
        if($context->GetUser()->GetId() < 1){
            throw new Exceptions\ResourceInaccessible('users');
        }

        if($user_id == 'current' || $user_id == ''){
            $current_user = $context->GetUser();
            $this->AddSubResource('current', new User($current_user));
        }

        if($user_id != 'current'){
            $all_users = \Entities\User::GetAll();
            foreach($all_users as $user){
                $this->AddSubResource($user->GetId(), new User($user));
            }
        }

        return false;
    }
}
?>