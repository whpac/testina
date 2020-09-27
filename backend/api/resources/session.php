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
            'is_authorized'
        ];
    }

    public function is_authorized(): bool{
        return AuthManager::IsAuthorized();
    }
}
?>