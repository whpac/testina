<?php
namespace Api\Resources;

use Api\Schemas;
use Api\Validation\TypeValidator;
use Auth\AuthManager;
use Log\Logger;
use Log\LogChannels;

class Session extends Resource implements Schemas\Session{

    /**
     * Niszczy sesję, czyli wylogowuje
     */
    public function Delete($source){
        AuthManager::LogOut();
        Logger::Log('Wylogowano użytkownika', LogChannels::AUTHORIZATION_LOG_OUT);
    }

    public function GetKeys(): array{
        return [
            'is_authorized',
            'expire_time'
        ];
    }

    public function is_authorized(): bool{
        return AuthManager::IsAuthorized();
    }

    public function expire_time(): ?string{
        if(!$this->is_authorized()) return null;
        return \Session\SessionManager::GetExpireTime()->format('Y-m-d H:i:s');
    }
}
?>