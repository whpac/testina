<?php
namespace Handling;

class LoginHandler extends \Auth\Providers\LoginPasswordDatabase {

    public function __construct(){
        parent::__construct('users', 'id', 'login', 'password_hash');
        $this->hash_algorithm = 'sha256';
    }
}
?>