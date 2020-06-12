<?php
namespace Entities;

class UserFactory implements \UEngine\Modules\Auth\AccessControl\IUserFactory {

    public /* User */ function Create($user_id){
        return new User($user_id);
    }
}
?>