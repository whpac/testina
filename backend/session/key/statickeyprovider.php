<?php
namespace Session\Key;

use \UEngine\Modules\Core;

/**
 * Dostawca niezmiennego klucza sesji
 */
class StaticKeyProvider implements IKeyProvider {
    protected $key;

    /**
     * Dostawca niezmiennego klucza sesji
     * @param $key Klucz sesji
     */
    public function __construct($key){
        $this->key = $key;
    }

    /**
     * Sprawdza, czy klucz został zdefiniowany
     * 
     * Dostawca niezmiennego klucza zawsze ma zdefiniowany klucz,
     * więc metoda zwraca true w każdym przypadku
     */
    public function KeyExists(){
        return true;
    }

    /**
     * Zwraca klucz sesji
     */
    public function GetKey(){
        return $this->key;
    }

    /**
     * Ustawia nowy klucz sesji
     * 
     * Dostawca niezmiennego klucza nie pozwala na modyfikowanie klucza,
     * dlatego zgłaszany jest wyjątek
     */
    public function SetKey($key){
        throw new Core\RichException('Klucz sesji nie może zostać zmieniony.');
    }
}
?>