<?php
namespace Auth\AccessControl;

interface User {

    public function GetId();

    public function GetPriviledges();
}
?>