<?php
namespace Auth\ExternalLogin;

class OfficeUserFactory implements \Auth\Users\UserFactory{

    public /* OfficeUser */ function Create($user_id){
        return new OfficeUser($user_id);
    }
}
?>