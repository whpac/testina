<?php
namespace Entities;

class UserFactory implements \Auth\Users\UserFactory {

    public /* User */ function Create($user_id){
        return new User($user_id);
    }
}
?>