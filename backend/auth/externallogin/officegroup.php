<?php
namespace Auth\ExternalLogin;

use Log\Logger;
use Log\LogChannels;

class OfficeGroup{
    protected /* int */ $Id = null;
    protected /* string */ $Name = null;
    protected /* User[] */ $Members = null;

    public function __construct(?string $id = null, ?string $name = null, ?array $members = null){
        $this->Id = $id;
        $this->Name = $name;
        $this->Members = $members;
    }

    public /* int */ function GetId(){
        if(is_null($this->Id)) $this->FetchData();
        return $this->Id;
    }

    public /* string */ function GetName(): string{
        if(is_null($this->Name)) $this->FetchData();
        return $this->Name;
    }

    public /* User[] */ function GetUsers(): array{
        if(is_null($this->Members)) self::FetchMembers($this->GetId());
        return $this->Members;
    }

    protected function FetchData(){
        if(is_null($this->Id) || $this->Id === 0){
            $this->PopulateDefaults();
            return;
        }

        $url = 'https://graph.microsoft.com/v1.0/groups/'.$this->Id.'/?$select=id,displayName';

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
            Logger::Log('Nie udało się pobrać informacji o grupie z serwera Office 365.', LogChannels::EXTERNAL_API);
            throw new \Exception('Nie udało się pobrać informacji o grupie z serwera Office 365.');
        }

        $parsed = json_decode($result, true);

        $this->Id = $parsed['id'];
        $this->Name = $parsed['displayName'];
    }

    public static function FetchMembers($group_id){
        if($group_id === '0'){
            return [];
        }

        $url = 'https://graph.microsoft.com/v1.0/groups/'.$group_id.'/members?$select=id,givenName,surname,displayName';

        // Opcje żądania
        $options = array(
            'http' => array(
                'header'  => "Authorization: Bearer ".TokenManager::GetAccessToken()."\r\n",
                'method'  => 'GET',
            )
        );

        $members = [];
        $context = stream_context_create($options);

        do{
            // Wykonaj żądanie
            $result = @file_get_contents($url, false, $context);
            if ($result === false) {
                Logger::Log('Nie udało się pobrać informacji o członkach grupy z serwera Office 365.', LogChannels::EXTERNAL_API);
                throw new \Exception('Nie udało się pobrać informacji o członkach grupy z serwera Office 365.');
            }

            $parsed = json_decode($result, true);

            foreach($parsed['value'] as $user){
                $first_name = $user['givenName'];
                $last_name = $user['surname'];
                if(is_null($first_name) || is_null($last_name)){
                    $display_name = $user['displayName'];
                    $last_space = strrpos($display_name, ' ');
                    if($last_space !== false){
                        $first_name = substr($display_name, 0, $last_space);
                        $last_name = substr($display_name, $last_space + 1);
                    }else{
                        $first_name = $display_name;
                        $last_name = '';
                    }
                }

                $members[] = new \Entities\User([
                    'user_id' => $user['id'],
                    'first_name' => $first_name,
                    'last_name' => $last_name,
                    'flags' => 0,
                    'expire_date' => (new \DateTime())->format('Y-m-d H:i:s')
                ]);
            }
            $url = $parsed['@odata.nextLink'];
        }while(isset($parsed['@odata.nextLink']));

        return $members;
    }

    protected function PopulateDefaults(){
        $this->Id = 0;
        $this->Name = 'Nieznana grupa – błąd ładowania';
    }

    public static /* Group[] */ function GetAll(){
        $url = 'https://graph.microsoft.com/v1.0/groups/?$select=id,displayName';

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
                Logger::Log('Nie udało się pobrać informacji o grupach z serwera Office 365.', LogChannels::EXTERNAL_API);
                throw new \Exception('Nie udało się pobrać informacji o grupach z serwera Office 365.');
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
}
?>