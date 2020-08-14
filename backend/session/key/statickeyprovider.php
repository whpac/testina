<?php
namespace Session\Key;

use \UEngine\Modules\Core;

class StaticKeyProvider implements IKeyProvider {
    protected $key;

    /**
     * Creates the class with specified static and immutable key.
     */
    public function __construct($key){
        $this->key = $key;
    }

    /**
     * Since key exists always, it returns true.
     */
    public function KeyExists(){
        return true;
    }

    /**
     * Returns the key.
     */
    public function GetKey(){
        return $this->key;
    }

    /**
     * Throws an exception since the key is immutable
     */
    public function SetKey($key){
        throw new Core\RichException('Klucz sesji nie może zostać zmieniony.');
    }
}
?>