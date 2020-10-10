<?php
namespace Entities;

use Auth\ExternalLogin\OfficeGroup;
use Database\DatabaseManager;
use Log\Logger;
use Log\LogChannels;

define('TABLE_GROUPS', 'cache_groups');
define('TABLE_GROUP_MEMBERS', 'cache_group_members');
define('TABLE_CACHE', 'cache_master');
define('GROUP_CACHE_PERIOD', '+12 hours');

class Group extends EntityWithFlags implements \Auth\Users\Group{
    protected /* string */ $group_id;
    protected /* string */ $name;
    protected /* DateTime */ $expire_date;

    // Maski bitowe flag
    protected const FLAG_ALL_USERS_CACHED = 1;

    protected static /* string */ function GetTableName(){
        return TABLE_GROUPS;
    }

    protected static /* bool */ function AllowsDeferredFetch(){
        return true;
    }

    protected function OnPopulate(): void{
        parent::OnPopulate();

        $this->expire_date = new \DateTime($this->expire_date);
    }

    public function GetId(): string{
        $this->FetchIfNeeded($this->group_id);
        return $this->group_id;
    }

    public function GetName(): string{
        $this->FetchIfNeeded();
        return $this->name;
    }

    protected function AreAllUsersCached(): bool{
        $this->FetchIfNeeded();
        return ($this->GetFlagValue(self::FLAG_ALL_USERS_CACHED) == 1);
    }

    public /* User[] */ function GetUsers(): array{
        if($this->AreAllUsersCached()){
            return $this->GetUsersFromCache();
        }else{
            return $this->GetUsersFromRemote();
        }
    }

    protected function GetUsersFromCache(){
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

    protected function GetUsersFromRemote(){
        $users = OfficeGroup::FetchMembers($this->GetId());

        $is_success = true;
        $expire_date = (new \DateTime(GROUP_CACHE_PERIOD))->format('Y-m-d H:i:s');
        foreach($users as $user){
            $result = DatabaseManager::GetProvider()
                    ->Table(TABLE_GROUP_MEMBERS)
                    ->Replace()
                    ->Value('user_id', $user->GetId())
                    ->Value('group_id', $this->GetId())
                    ->Value('expire_date', $expire_date)
                    ->Run();

            if($result === false){
                $is_success = false;
                break;
            }
        }

        if($is_success){
            $new_flags = self::ConvertFlagsToInt([self::FLAG_ALL_USERS_CACHED => true], $this->GetFlags());

            DatabaseManager::GetProvider()
                    ->Table(TABLE_GROUPS)
                    ->Update()
                    ->Set('flags', $new_flags)
                    ->Where('group_id', '=', $this->GetId())
                    ->Run();
        }

        return $users;
    }

    protected static function FetchEntity(string $table_name, $entity_id){
        $result = DatabaseManager::GetProvider()
                ->Table($table_name)
                ->Select()
                ->Where('group_id', '=', $entity_id)
                ->Run();

        // Jeżeli w pamięci podręcznej wskazana grupa istnieje, zwróć ją
        if($result->num_rows != 0){
            $row = $result->fetch_assoc();
            $expire_date = $row['expire_date'];

            // Sprawdź czy wpis w pamięci podręcznej nie jest przeterminowany
            if(new \DateTime($expire_date) > new \DateTime()) return $row;
        }

        // Pobierz dane z serwera Office i zapisz w bazie danych
        $group = new OfficeGroup($entity_id);
        $group_data = [
            'group_id' => $group->GetId(),
            'name' => $group->GetName(),
            'flags' => 0,
            'expire_date' => (new \DateTime(GROUP_CACHE_PERIOD))->format('Y-m-d H:i:s')
        ];

        $query = DatabaseManager::GetProvider()
                ->Table($table_name)
                ->Replace();
        foreach($group_data as $key => $value){
            $query->Value($key, $value);
        }
        $query->Run();

        return $group_data;
    }

    public static function GetAll(){
        $cache_result = DatabaseManager::GetProvider()
                ->Table(TABLE_CACHE)
                ->Select()
                ->Where('key', '=', 'groups_all')
                ->Run();

        $is_cached = false;
        if($cache_result->num_rows != 0){
            $row = $cache_result->fetch_assoc();
            $is_cached = $row['value'] != '0';
            $is_cached = $is_cached && (new \DateTime($row['expire_date']) > new \DateTime());
        }

        if($is_cached){
            return self::ReadAllGroupsFromCache();
        }else{
            return self::ReadAllGroupsFromRemote();
        }
    }

    protected static function ReadAllGroupsFromCache(){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_GROUPS)
                ->Select()
                ->Run();

        $groups = [];
        for($i = 0; $i < $result->num_rows; $i++){
            $groups[] = new Group($result->fetch_assoc());
        }
        return $groups;
    }

    protected static function ReadAllGroupsFromRemote(){
        $groups = OfficeGroup::GetAll();

        $is_success = true;
        $expire_date = (new \DateTime(GROUP_CACHE_PERIOD))->format('Y-m-d H:i:s');
        foreach($groups as $group){
            $result = DatabaseManager::GetProvider()
                    ->Table(TABLE_GROUPS)
                    ->Replace()
                    ->Value('group_id', $group->GetId())
                    ->Value('name', $group->GetName())
                    ->Value('flags', 0)
                    ->Value('expire_date', $expire_date)
                    ->Run();

            if($result === false){
                $is_success = false;
            }
        }

        if($is_success){
            DatabaseManager::GetProvider()
                    ->Table(TABLE_CACHE)
                    ->Update()
                    ->Set('value', '1')
                    ->Set('expire_date', $expire_date)
                    ->Where('key', '=', 'groups_all')
                    ->Run();
        }

        return $groups;
    }
}
?>