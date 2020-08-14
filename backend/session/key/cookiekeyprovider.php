<?php
namespace Session\Key;

class CookieKeyProvider implements KeyProvider {
    protected $cookie_name;

    /**
     * Creates the class and assigns it to the specified cookie.
     */
    public function __construct($cookie_name){
        $this->cookie_name = $cookie_name;
    }

    /**
     * Checks if $_COOKIE[cookie_name] exists.
     */
    public function KeyExists(){
        return isset($_COOKIE[$this->cookie_name]);
    }

    /**
     * Returns the key.
     */
    public function GetKey(){
        return $_COOKIE[$this->cookie_name];
    }

    /**
     * Saves new session key in a cookie
     */
    public function SetKey($key){
        setcookie($this->cookie_name, $key, 0, '/');
        $_COOKIE[$this->cookie_name] = $key;
    }
}
?>