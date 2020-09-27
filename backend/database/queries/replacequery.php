<?php
namespace Database\Queries;

use Database\Entities;

class ReplaceQuery implements Query {
    public $table = null;
    public $columns = [];
    public $values = [];
    protected $table_ref = null;

    public function GetType(){
        return 'REPLACE';
    }

    public function __construct(Entities\Table $table){
        $this->table_ref = $table;
        $this->table = $table->name;
    }

    public function Run(){
        return $this->table_ref->Query($this);
    }

    public function Value($column, $value){
        $this->columns[] = $column;
        $this->values[] = $value;
        return $this;
    }
}
?>