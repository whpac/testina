<?php
namespace Api\Schemas;

interface Collection {

    // Służy do wywoływania dowolnej funkcji, bo elementy w kolekcji mogą
    // mieć dowolną nazwę
    public function __call($key, $args);
}
?>