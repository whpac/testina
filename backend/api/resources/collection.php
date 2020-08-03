<?php
namespace Api\Resources;

use Api\Schemas;

class Collection extends Resource implements Schemas\Collection{
    protected $Items;
    protected $Parent;

    public function __construct($items, $parent = null){
        $this->Items = $items;
        $this->Parent = $parent;
    }

    public function GetKeys(): array{
        return array_keys($this->Items);
    }

    public function KeyExists($key_name): bool{
        return array_key_exists($key_name, $this->Items);
    }

    public function __call($name, $args){
        if(!isset($this->Items[$name])) throw new \BadMetodCallException('Indeks '.urlencode($name).' nie istnieje w tej kolekcji.');
        
        $item = $this->Items[$name];
        $item->SetContext($this->GetContext());
        return $item;
    }
}
?>