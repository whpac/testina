<?php
namespace Entities;

use Database\DatabaseManager;

define('TABLE_SURVEYS', 'surveys');

class Survey extends Entity {
    protected /* int */ $id;
    protected /* int */ $author_id;
    protected /* string */ $name;
    protected /* string */ $description;

    protected static /* string */ function GetTableName(){
        return TABLE_SURVEYS;
    }

    protected static /* bool */ function AllowsDeferredFetch(){
        return true;
    }

    protected /* void */ function OnPopulate(){
        settype($this->id, 'int');
        settype($this->author_id, 'int');
    }

    public /* int */ function GetId(){
        $this->FetchIfNeeded($this->id);
        return $this->id;
    }

    public /* User */ function GetAuthor(){
        $this->FetchIfNeeded();
        return new User($this->author_id);
    }

    public /* string */ function GetName(){
        $this->FetchIfNeeded();
        return $this->name;
    }

    public /* ?string */ function GetDescription(){
        $this->FetchIfNeeded();
        return $this->description;
    }

    public static /* Survey[] */ function GetCreatedByUser(User $user){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_SURVEYS)
                ->Select()
                ->Where('author_id', '=', $user->GetId())
                ->Run();
        
        $surveys = [];
        for($i = 0; $i < $result->num_rows; $i++){
            $surveys[] = new Survey($result->fetch_assoc());
        }
        return $surveys;
    }
}
?>