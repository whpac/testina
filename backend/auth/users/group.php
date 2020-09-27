<?php
namespace Auth\Users;

interface Group {

    public function GetId();
    public function GetName(): string;
    public function GetUsers(): array;
}
?>