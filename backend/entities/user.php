<?php
namespace Entities;

use Auth\ExternalLogin\OfficeUser;
use Database\DatabaseManager;

define('TABLE_USERS', 'cache_users');
define('TABLE_GROUP_MEMBERS', 'cache_group_members');
define('TABLE_CACHE', 'cache_master');
define('USER_CACHE_PERIOD', '+12 hours');

class User extends EntityWithFlags implements \Auth\Users\User {
    protected /* string */ $user_id;
    protected /* string */ $first_name;
    protected /* string */ $last_name;
    protected /* DateTime */ $expire_date;

    // Maski bitowe flag
    protected const FLAG_ALL_GROUPS_CACHED = 1;

    protected static /* string */ function GetTableName(){
        return TABLE_USERS;
    }

    protected static /* bool */ function AllowsDeferredFetch(){
        return true;
    }

    protected static /* bool */ function IsDefault($id){
        return ($id === '0') || is_null($id);
    }

    protected /* void */ function PopulateDefaults(){
        $this->id = '0';
        $this->first_name = 'Anonimowy';
        $this->last_name = 'Użytkownik';
        $this->login = '';
    }

    protected function OnPopulate(): void{
        parent::OnPopulate();

        $this->expire_date = new \DateTime($this->expire_date);
    }

    public function GetId(): ?string{
        $this->FetchIfNeeded($this->user_id);
        return $this->user_id;
    }

    public function GetFirstName(): string{
        $this->FetchIfNeeded();
        return $this->first_name;
    }

    public function GetLastName(): string{
        $this->FetchIfNeeded();
        return $this->last_name;
    }

    public function GetFullName(): string{
        $this->FetchIfNeeded();
        return $this->first_name.' '.$this->last_name;
    }

    protected function AreAllGroupsCached(): bool{
        $this->FetchIfNeeded();
        return ($this->GetFlagValue(self::FLAG_ALL_GROUPS_CACHED) == 1);
    }

    public function IsFemale(): bool{
        $this->FetchIfNeeded();
        return (substr($this->first_name, -1, 1) == 'a');
    }

    public /* Group[] */ function GetGroups(): array{
        if($this->AreAllGroupsCached()){
            return $this->GetGroupsFromCache();
        }else{
            return $this->GetGroupsFromRemote();
        }
    }

    protected function GetGroupsFromCache(): array{
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_GROUP_MEMBERS)
                ->Select()
                ->Where('user_id', '=', $this->GetId())
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

    protected function GetGroupsFromRemote(): array{
        $groups = OfficeUser::GetGroupsForUser($this->GetId());

        $is_success = true;
        $expire_date = (new \DateTime(USER_CACHE_PERIOD))->format('Y-m-d H:i:s');
        foreach($groups as $group){
            $result = DatabaseManager::GetProvider()
                    ->Table(TABLE_GROUP_MEMBERS)
                    ->Replace()
                    ->Value('user_id', $this->GetId())
                    ->Value('group_id', $group->GetId())
                    ->Value('expire_date', $expire_date)
                    ->Run();

            if($result === false){
                $is_success = false;
                break;
            }
        }

        if($is_success){
            $new_flags = self::ConvertFlagsToInt([self::FLAG_ALL_GROUPS_CACHED => true], $this->GetFlags());

            DatabaseManager::GetProvider()
                    ->Table(TABLE_USERS)
                    ->Update()
                    ->Set('flags', $new_flags)
                    ->Where('user_id', '=', $this->GetId())
                    ->Run();
        }

        return $groups;
    }

    protected static function FetchEntity(string $table_name, $entity_id){
        $result = DatabaseManager::GetProvider()
                ->Table($table_name)
                ->Select()
                ->Where('user_id', '=', $entity_id)
                ->Run();

        // Jeżeli w pamięci podręcznej wskazany użytkownik istnieje, zwróć go
        if($result->num_rows != 0){
            $row = $result->fetch_assoc();
            $expire_date = $row['expire_date'];

            // Sprawdź czy wpis w pamięci podręcznej nie jest przeterminowany
            if(new \DateTime($expire_date) > new \DateTime()) return $row;
        }

        // Pobierz dane z serwera Office i zapisz w bazie danych
        $user = new OfficeUser($entity_id);
        $user_data = [
            'user_id' => $user->GetId(),
            'first_name' => $user->GetFirstName(),
            'last_name' => $user->GetLastName(),
            'flags' => 0,
            'expire_date' => (new \DateTime(USER_CACHE_PERIOD))->format('Y-m-d H:i:s')
        ];

        $query = DatabaseManager::GetProvider()
                ->Table($table_name)
                ->Replace();
        foreach($user_data as $key => $value){
            $query->Value($key, $value);
        }
        $query->Run();

        return $user_data;
    }

    public static function GetAll(){
        $cache_result = DatabaseManager::GetProvider()
                ->Table(TABLE_CACHE)
                ->Select()
                ->Where('key', '=', 'users_all')
                ->Run();

        $is_cached = false;
        if($cache_result->num_rows != 0){
            $row = $cache_result->fetch_assoc();
            $is_cached = $row['value'] != '0';
            $is_cached = $is_cached && (new \DateTime($row['expire_date']) > new \DateTime());
        }

        if($is_cached){
            return self::ReadAllUsersFromCache();
        }else{
            return self::ReadAllUsersFromRemote();
        }
    }

    protected static function ReadAllUsersFromCache(){
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

    protected static function ReadAllUsersFromRemote(){
        $users = OfficeUser::GetAll();

        $is_success = true;
        $expire_date = (new \DateTime(USER_CACHE_PERIOD))->format('Y-m-d H:i:s');
        foreach($users as $user){
            $result = DatabaseManager::GetProvider()
                    ->Table(TABLE_USERS)
                    ->Replace()
                    ->Value('user_id', $user->GetId())
                    ->Value('first_name', $user->GetFirstName())
                    ->Value('last_name', $user->GetLastName())
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
                    ->Where('key', '=', 'users_all')
                    ->Run();
        }

        return $users;
    }
}
?>