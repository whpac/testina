<?php
namespace Api;

class Root extends Resource {

    public function __construct(){
        $this->AddSubResource('lorem', null);
    }
}
?>