<?php
namespace Entities;

use \UEngine\Modules\Core\RichException;
use \UEngine\Modules\Core\Database\DatabaseManager;

define('TABLE_GROUPS', 'groups');

class Group extends Entity{
    protected /* int */ $id;
    protected /* string */ $name;

    protected static /* string */ function GetTableName(){
        return TABLE_GROUPS;
    }

    protected static /* bool */ function AllowsDeferredFetch(){
        return true;
    }

    protected /* void */ function OnPopulate(){
        settype($this->id, 'int');
        settype($this->name, 'string');
    }

    public /* int */ function GetId(){
        return $this->id;
    }

    public /* string */ function GetName(){
        $this->FetchIfNeeded();
        return $this->name;
    }

    public static /* Group[] */ function GetAll(){
        $groups = [];
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_GROUPS)
                ->Select()
                ->Run();

        for($i=0; $i<$result->num_rows; $i++){
            $row = $result->fetch_assoc();
            $groups[] = new Group($row);
        }

        return $groups;
    }
}
?>