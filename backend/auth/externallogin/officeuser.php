<?php
namespace Auth\ExternalLogin;

use Log\Logger;
use Log\LogChannels;

class OfficeUser {
    protected $Id = null;
    protected $FirstName = null;
    protected $LastName = null;

    public function __construct(?string $id = null, ?string $first_name = null, ?string $last_name = null){
        $this->Id = $id;
        $this->FirstName = $first_name;
        $this->LastName = $last_name;
    }

    public function GetId(){
        if(is_null($this->Id)) $this->FetchData();
        return $this->Id;
    }

    public function GetFirstName(): string{
        if(is_null($this->FirstName)) $this->FetchData();
        return $this->FirstName;
    }

    public function GetLastName(): string{
        if(is_null($this->LastName)) $this->FetchData();
        return $this->LastName;
    }

    public /* string */ function GetFullName(): string{
        return $this->GetFirstName().' '.$this->GetLastName();
    }

    public /* Group[] */ function GetGroups(): array{
        return self::GetGroupsForUser($this->GetId());
    }

    public static /* Group[] */ function GetGroupsForUser($user_id): array{
        $url = 'https://graph.microsoft.com/v1.0/users/'.$user_id.'/memberOf/?$select=id,displayName';

        // Opcje żądania
        $options = array(
            'http' => array(
                'header'  => "Authorization: Bearer ".TokenManager::GetAccessToken()."\r\n",
                'method'  => 'GET',
            )
        );

        $groups = [];
        $context = stream_context_create($options);

        do{
            // Wykonaj żądanie
            $result = @file_get_contents($url, false, $context);
            if ($result === false) {
                Logger::Log('Nie udało się pobrać informacji o grupach, do których należy użytkownik z serwera Office 365.', LogChannels::EXTERNAL_API);
                throw new \Exception('Nie udało się pobrać informacji o grupach, do których należy użytkownik z serwera Office 365.');
            }

            $parsed = json_decode($result, true);

            foreach($parsed['value'] as $group){
                $groups[] = new \Entities\Group([
                    'group_id' => $group['id'],
                    'name' => $group['displayName'],
                    'flags' => 0,
                    'expire_date' => (new \DateTime())->format('Y-m-d H:i:s')
                ]);
            }
            $url = $parsed['@odata.nextLink'];
        }while(isset($parsed['@odata.nextLink']));

        return $groups;
    }

    public /* bool */ function IsFemale(): bool{
        return (substr($this->GetFirstName(), -1, 1) == 'a');
    }

    protected function FetchData(){
        if($this->Id === '0'){
            $this->PopulateDefaults();
            return;
        }

        $resource = 'me';
        if(!is_null($this->Id)){
            $resource = 'users/'.$this->Id;
        }

        $url = 'https://graph.microsoft.com/v1.0/'.$resource.'/?$select=id,givenName,surname';

        // Opcje żądania
        $options = array(
            'http' => array(
                'header'  => "Authorization: Bearer ".TokenManager::GetAccessToken()."\r\n",
                'method'  => 'GET',
            )
        );

        // Wykonaj żądanie
        $context = stream_context_create($options);
        $result = @file_get_contents($url, false, $context);
        if ($result === false) {
            Logger::Log('Nie udało się pobrać informacji o użytkowniku z serwera Office 365.', LogChannels::EXTERNAL_API);
            throw new \Exception('Nie udało się pobrać informacji o użytkowniku z serwera Office 365.');
        }

        $parsed = json_decode($result, true);

        $this->Id = $parsed['id'];
        $this->FirstName = $parsed['givenName'];
        $this->LastName = $parsed['surname'];
    }

    protected function PopulateDefaults(){
        $this->Id = 0;
        $this->FirstName = 'Użytkownik';
        $this->LastName = 'Anonimowy';
    }

    public static function GetAll(){
        $url = 'https://graph.microsoft.com/v1.0/users/?$select=id,givenName,surname';

        // Opcje żądania
        $options = array(
            'http' => array(
                'header'  => "Authorization: Bearer ".TokenManager::GetAccessToken()."\r\n",
                'method'  => 'GET',
            )
        );

        $users = [];
        $context = stream_context_create($options);

        do{
            // Wykonaj żądanie
            $result = @file_get_contents($url, false, $context);
            if ($result === false) {
                Logger::Log('Nie udało się pobrać informacji o użytkownikach z serwera Office 365.', LogChannels::EXTERNAL_API);
                throw new \Exception('Nie udało się pobrać informacji o użytkownikach z serwera Office 365.');
            }

            $parsed = json_decode($result, true);

            foreach($parsed['value'] as $user){
                $users[] = new \Entities\User([
                    'user_id' => $user['id'],
                    'first_name' => $user['givenName'],
                    'last_name' => $user['surname'],
                    'flags' => 0,
                    'expire_date' => (new \DateTime())->format('Y-m-d H:i:s')
                ]);
            }
            $url = $parsed['@odata.nextLink'];
        }while(isset($parsed['@odata.nextLink']));

        return $users;
    }

    public function __toString(){
        try{
            return $this->GetFirstName().' '.$this->GetLastName().' ('.$this->GetId().')';
        }catch(\Exception $e){
            return 'Użytkownik Office (błąd wczytywania)';
        }
    }
}
?>