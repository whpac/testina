<?php
namespace Entities;

use \UEngine\Modules\Core\RichException;
use \UEngine\Modules\Core\Database\DatabaseManager;

class Group{
    protected $id;

    public function GetId(){
        return $this->id;
    }
}
?>