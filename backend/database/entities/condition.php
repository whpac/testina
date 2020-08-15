<?php
namespace Database\Entities;

class Condition {
    public $operator = 'AND';
    public $subconditions = [];

    public function __construct($operator = 'AND'){
        $this->operator = $operator;
    }

    public function Add($subcondition){
        $this->subconditions[] = $subcondition;
    }

    public function SubconditionCount(){
        return count($this->subconditions);
    }

    public function Parse(){
        $result = '';

        foreach($this->subconditions as $cond){
            if($result != '') $result .= $this->operator;

            if(is_string($cond)) $result .= ' '.$cond.' ';
            else $result  .= ' ('.$cond->Parse().') ';
        }

        return $result;
    }
}
?>