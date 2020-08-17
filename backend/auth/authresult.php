<?php
namespace Auth;

use \UEngine\Modules\Core\RichException;

class AuthResult {
    protected $is_success;
    protected $user_id;
    protected $user_data;
    protected $reason;

    public function __construct(bool $is_success, $user_id = null, $user_data = null, $reason = null){
        $this->is_success = $is_success;
        $this->user_id = $user_id;
        $this->user_data = $user_data;
        $this->reason = $reason;

        if($this->IsSuccess() && is_null($this->GetUserId()))
            throw new RichException('Id użytkownika nie może być null, kiedy logowanie przebiegło pomyślnie.');
    }

    public function IsSuccess(){
        return $this->is_success;
    }

    public function GetUserId(){
        return $this->user_id;
    }

    public function GetUserData(){
        return $this->user_data;
    }

    public function GetReason(){
        return $this->reason;
    }

    const REASON_NO_USERS_MATCHING = 1;
    const REASON_MULTIPLE_USERS_MATCHING = 2;
    const REASON_POSSIBLE_SQL_INJECTION = 3;
}
?>