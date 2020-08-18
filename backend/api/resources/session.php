<?php
namespace Api\Resources;

use Api\Schemas;
use Log\Logger;
use Log\LogChannels;

class Session extends Resource implements Schemas\Session{

    /**
     * Tworzy sesję, czyli loguje użytkownika
     */
    public function CreateSubResource($source){
        $login = $source->login;
        $password = $source->password;

        $result = \Auth\AuthManager::TryToLogIn($login, $password);
        if($result->IsSuccess()){
            Logger::Log('Zalogowano: '.$login, LogChannels::AUTHORIZATION_SUCCESS);
        }else{
            Logger::Log('Nieudana próba logowania: '.$login, LogChannels::AUTHORIZATION_FAILED);
        }
        return new LoginResponse($result->IsSuccess(), $result->GetReason());
    }

    /**
     * Niszczy sesję, czyli wylogowuje
     */
    public function Delete($source){
        \Auth\AuthManager::LogOut();
        Logger::Log('Wylogowano użytkownika', LogChannels::AUTHORIZATION_LOG_OUT);
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