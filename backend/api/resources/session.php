<?php
namespace Api\Resources;

class Session extends Resource{

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
        return [];
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