<?php
namespace Api\Resources;

use Api\Schemas;
use Api\Validation\TypeValidator;
use Auth\AuthManager;
use Log\Logger;
use Log\LogChannels;

class Session extends Resource implements Schemas\Session{

    /**
     * Tworzy sesję, czyli loguje użytkownika
     */
    public function CreateSubResource($source){
        TypeValidator::AssertIsObject($source);
        TypeValidator::AssertIsString($source->login, 'login');
        TypeValidator::AssertIsString($source->password, 'password');

        $login = $source->login;
        $password = $source->password;

        $result = AuthManager::TryToLogIn($login, $password);
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
        AuthManager::LogOut();
        Logger::Log('Wylogowano użytkownika', LogChannels::AUTHORIZATION_LOG_OUT);
    }

    public function GetKeys(): array{
        return [
            'is_authorized'
        ];
    }

    public function is_authorized(): bool{
        return AuthManager::IsAuthorized();
    }
}

class LoginResponse extends Resource {
    protected $IsSuccess;
    protected $Reason;

    public function __construct(bool $is_success, ?int $reason){
        parent::__construct();

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