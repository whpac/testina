<?php
namespace Database\Queries;

use Database\Entities;

class InsertQuery implements Query {
    public $table = null;
    public $columns = [];
    public $values = [];
    protected $table_ref = null;

    public function GetType(){
        return 'INSERT';
    }

    public function __construct(Entities\Table $table, array $columns = []){
        $this->table_ref = $table;
        $this->table = $table->name;
        $this->columns = $columns;
    }

    public function Run(){
        return $this->table_ref->Query($this);
    }

    public function Values(array $values){
        $this->values = array_merge($this->values, $values);
        return $this;
    }

    public function Value($column, $value){
        $this->columns[] = $column;
        $this->values[] = $value;
        return $this;
    }
}
?>