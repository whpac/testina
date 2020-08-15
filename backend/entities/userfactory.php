<?php
namespace Entities;

class UserFactory implements \Auth\AccessControl\UserFactory {

    public /* User */ function Create($user_id){
        return new User($user_id);
    }
}
?>