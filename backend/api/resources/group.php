<?php
namespace Api\Resources;

use Api\Schemas;

class Group extends Resource implements Schemas\Group{
    protected $Group;

    protected function LazyLoad($group, $name){
        /*$this->AddSubResource('id', new ValueResource($group->GetId()));
        $this->AddSubResource('name', new ValueResource($group->GetName()));
        return true;*/
    }

    public function __construct($group){
        parent::__construct($group);
        if(is_null($group)) throw new \Exception('$group nie może być null.');
        $this->Group = $group;
    }

    public function GetKeys(): array{
        return [
            'id',
            'name'
        ];
    }

    public function id(): int{
        return $this->Group->GetId();
    }

    public function name(): string{
        return $this->Group->GetName();
    }
}
?>