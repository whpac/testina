<?php
namespace Session\Key;

/**
 * Ogólny interfejs określający dostawcę klucza sesji
 */
interface KeyProvider {

    /**
     * Sprawdza, czy klucz sesji został zdefiniowany
     */
    public function KeyExists();

    /**
     * Zwraca zapisany klucz sesji
     */
    public function GetKey();

    /**
     * Ustawia nowy klucz sesji
     */
    public function SetKey($key);
}
?>