<?php
namespace Auth\Users;

interface User {

    public function GetId();

    public function GetFirstName(): string;
    public function GetLastName(): string;
    public function GetFullName(): string;

    public /* Group[] */ function GetGroups(): array;

    public function IsFemale(): bool;
    public function IsTestCreator(): bool;

    //public function GetPriviledges();
}
?>