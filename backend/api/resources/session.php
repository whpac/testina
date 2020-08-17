<?php
namespace Api\Resources;

use Api\Schemas;

class Session extends Resource implements Schemas\Session{

    /**
     * Tworzy sesję, czyli loguje użytkownika
     */
    public function CreateSubResource($source){
        $login = $source->login;
        $password = $source->password;

        $result = \Auth\AuthManager::TryToLogIn($login, $password);
        return new LoginResponse($result->IsSuccess(), $result->GetReason());
    }

    public function GetKeys(): array{
        return [
            'is_authorized'
        ];
    }

    public function is_authorized(): bool{
        return \Auth\AuthManager::IsAuthorized();
    }
}

class LoginResponse extends Resource {
    protected $IsSuccess;
    protected $Reason;

    public function __construct(bool $is_success, ?int $reason){
        $this->IsSuccess = $is_success;
        $this->Reason = $reason;
    }

    public function GetKeys(): array{
        return [
            'is_success',
            'reason'
        ];
    }

    public function is_success(): bool{
        return $this->IsSuccess;
    }

    public function user_id(): ?int{
        return 0;
    }

    public function reason(): ?int{
        return $this->Reason;
    }
}
?>