<?php
namespace Auth\Providers;

interface AuthProvider {

    public function Validate(array $input);
}
?>