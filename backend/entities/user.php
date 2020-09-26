<?php
namespace Entities;

use Database\DatabaseManager;

define('TABLE_USERS', 'users');

class User extends Entity implements \Auth\Users\User {
    protected /* int */ $id;
    protected /* string */ $first_name;
    protected /* string */ $last_name;
    protected /* string */ $login;

    protected static /* string */ function GetTableName(){
        return TABLE_USERS;
    }

    protected static /* bool */ function AllowsDeferredFetch(){
        return true;
    }

    protected /* void */ function OnPopulate(){
        unset($this->password_hash);    // Gets added by Entity constructor automatically

        settype($this->id, 'int');
        settype($this->priviledges, 'int');
    }

    protected static /* bool */ function IsDefault($id){
        return ($id == 0);
    }

    public static function GetAll(){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_USERS)
                ->Select()
                ->Run();

        $users = [];
        for($i = 0; $i < $result->num_rows; $i++){
            $users[] = new User($result->fetch_assoc());
        }
        return $users;
    }

    protected /* void */ function PopulateDefaults(){
        $this->id = 0;
        $this->first_name = 'Anonimowy';
        $this->last_name = 'Użytkownik';
        $this->login = '';
    }

    public /* int */ function GetId(){
        $this->FetchIfNeeded($this->id);
        return $this->id;
    }

    public /* string */ function GetFirstName(){
        $this->FetchIfNeeded();
        return $this->first_name;
    }

    public /* string */ function GetLastName(){
        $this->FetchIfNeeded();
        return $this->last_name;
    }

    public /* string */ function GetFullName(){
        $this->FetchIfNeeded();
        return $this->first_name.' '.$this->last_name;
    }

    public /* Group[] */ function GetGroups(){
        return [];
    }

    public /* bool */ function IsFemale(){
        $this->FetchIfNeeded();
        return (substr($this->first_name, -1, 1) == 'a');
    }
}
?>