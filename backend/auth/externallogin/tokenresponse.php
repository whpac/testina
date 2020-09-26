<?php
namespace Auth\ExternalLogin;

class TokenResponse{
    public /* string */ $AccessToken;
    public /* string? */ $RefreshToken;
    public /* int */ $ExpiresIn;
}
?>