<?php
namespace Database\Queries;

use Database\Entities;

class DeleteQuery implements Query {
    public $table = null;
    public $where = null;
    protected $table_ref = null;

    public function GetType() {
        return 'DELETE';
    }

    public function __construct(Entities\Table $table){
        $this->table_ref = $table;
        $this->table = $table->name;
        $this->where = new Entities\Condition('AND');
    }

    public function Run(){
        return $this->table_ref->Query($this);
    }
    
    public function Where($column, $operator, $value){
        if(is_string($value)) $value = '"'.$value.'"';
        $where = '`'.$column.'` '.$operator.' '.$value;
        $this->where->Add($where);
        return $this;
    }

    public function WhereCondition($condition){
        $this->where = $condition;
        return $this;
    }

    public function AndWhere($column, $operator, $value){
        if(is_string($value)) $value = '"'.$value.'"';
        $where = '`'.$column.'` '.$operator.' '.$value;
        
        if($this->where->operator == 'AND' || $this->where->SubconditionCount() < 2){
            $this->where->Add($where);
            $this->where->operator = 'AND';
        }else{
            $w = $this->where;
            $this->where = new Entities\Condition('AND');
            $this->where->Add($w);
            $this->where->Add($where);
        }
        return $this;
    }

    public function OrWhere($column, $operator, $value){
        if(is_string($value)) $value = '"'.$value.'"';
        $where = '`'.$column.'` '.$operator.' '.$value;
        
        if($this->where->operator == 'OR' || $this->where->SubconditionCount() < 2){
            $this->where->Add($where);
            $this->where->operator = 'OR';
        }else{
            $w = $this->where;
            $this->where = new Entities\Condition('OR');
            $this->where->Add($w);
            $this->where->Add($where);
        }
        return $this;
    }
}
?>