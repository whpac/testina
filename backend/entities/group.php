<?php
namespace Entities;

use Database\DatabaseManager;

define('TABLE_GROUPS', 'groups');
define('TABLE_GROUP_MEMBERS', 'group_members');

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

    public /* User[] */ function GetUsers(){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_GROUP_MEMBERS)
                ->Select(['user_id'])
                ->Where('group_id', '=', $this->GetId())
                ->Run();

        $users = [];
        for($i = 0; $i < $result->num_rows; $i++){
            $row = $result->fetch_assoc();
            $users[] = new User($row['user_id']);
        }

        return $users;
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

    public static /* Group[] */ function GetGroupsForUser(User $user){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_GROUP_MEMBERS)
                ->Select()
                ->Where('user_id', '=', $user->GetId())
                ->Run();
        
        if($result === false){
            Logger::Log('Nie udało się pobrać grup użytkownika: '.DatabaseManager::GetProvider()->GetError(), LogChannels::DATABASE);
            throw new \Exception('Nie udało się pobrać grup, do których należy użytkownik');
        }

        $groups = [];
        for($i = 0; $i < $result->num_rows; $i++){
            $row = $result->fetch_assoc();
            $groups[] = new Group($row['group_id']);
        }

        return $groups;
    }
}
?>