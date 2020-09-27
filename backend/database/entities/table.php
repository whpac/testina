<?php
namespace Database\Entities;

use Database\Queries;
use Database\DatabaseProvider;

class Table {
    protected $db_reference;
    public $name;

    public function __construct(DatabaseProvider $db_reference, $name){
        $this->db_reference = $db_reference;
        $this->name = $name;
    }

    /**
     * Wykonuje zapytanie typu SELECT
     * @param $columns Kolumny do zwrócenia, w przypadku braku - zwrócone zostaną wszystkie kolumny
     */
    public function Select(array $columns = []){
        return new Queries\SelectQuery($this, $columns);
    }

    /**
     * Wykonuje zapytanie typu INSERT
     */
    public function Insert(){
        return new Queries\InsertQuery($this);
    }

    /**
     * Wykonuje zapytanie typu REPLACE
     */
    public function Replace(){
        return new Queries\ReplaceQuery($this);
    }

    /**
     * Wykonuje zapytanie typu UPDATE
     */
    public function Update(){
        return new Queries\UpdateQuery($this);
    }

    /**
     * Wykonuje zapytanie typu DELETE
     */
    public function Delete(){
        return new Queries\DeleteQuery($this);
    }

    /**
     * Wykonuje zapytanie nieokreślonego typu
     */
    public function Query($query){
        return $this->db_reference->Query($query);
    }
}
?>