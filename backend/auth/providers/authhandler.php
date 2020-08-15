<?php
namespace Auth\Providers;

interface AuthHandler extends AuthProvider {

    public function Handle();
    public function RequiresLoggedOff();
}
?>