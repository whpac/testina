<?php
namespace Auth\ExternalLogin;

class ExternalUser implements \Auth\Users\User {

    public function GetId(){
        return 0;
    }

    public function GetFirstName(): string{
        return '';
    }

    public function GetLastName(): string{
        return '';
    }

    public function GetFullName(): string{
        return '';
    }

    public /* Group[] */ function GetGroups(): array{
        return [];
    }

    public function IsFemale(): bool{
        return false;
    }
}
?>