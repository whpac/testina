<?php
namespace Session\Key;

interface KeyProvider {
    public function KeyExists();    // Whether the key was generated and saved earlier (i.e. cookie)
    public function GetKey();       // Returns the saved key
    public function SetKey($key);   // Sets a new key.
}
?>