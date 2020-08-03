<?php
namespace Api\Resources;

use Api\Schemas;

class Collection extends Resource implements Schemas\Collection{
    protected $items;

    public function __construct($items){
        $this->items = $items;
    }

    public function GetKeys(): array{
        return array_keys($this->items);
    }

    public function KeyExists($key_name): bool{
        return array_key_exists($key_name, $this->items);
    }

    public function __call($name, $args){
        if(!isset($this->items[$name])) throw new \BadMetodCallException('Indeks '.urlencode($name).' nie istnieje w tej kolekcji.');
        return $this->items[$name];
    }
}
?>