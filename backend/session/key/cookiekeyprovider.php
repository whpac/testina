<?php
namespace Session\Key;

/**
 * Dostawca klucza sesji z plików cookies
 */
class CookieKeyProvider implements KeyProvider {
    protected $cookie_name;

    /**
     * Dostawca klucza sesji z plików cookies
     * @param $cookie_name Nazwa ciasteczka z kluczem sesji
     */
    public function __construct($cookie_name){
        $this->cookie_name = $cookie_name;
    }

    /**
     * Sprawdza, czy klucz sesji został zdefiniowany
     */
    public function KeyExists(){
        return isset($_COOKIE[$this->cookie_name]);
    }

    /**
     * Zwraca klucz sesji
     */
    public function GetKey(){
        return $_COOKIE[$this->cookie_name];
    }

    /**
     * Zapisuje klucz sesji do ciasteczka
     * @param $key nowy klucz sesji
     */
    public function SetKey($key){
        if(CONFIG_USE_HTTPS){
            header('Set-Cookie: '.$this->cookie_name.'='.$key.'; Path=/; Max-Age='.CONFIG_SESSION_DURATION.'; Secure; HttpOnly; SameSite=Strict');
        }else{
            header('Set-Cookie: '.$this->cookie_name.'='.$key.'; Path=/; Max-Age='.CONFIG_SESSION_DURATION.'; HttpOnly; SameSite=Strict');
        }
        $_COOKIE[$this->cookie_name] = $key;
    }
}
?>