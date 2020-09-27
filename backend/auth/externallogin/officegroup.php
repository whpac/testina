<?php
namespace Auth\ExternalLogin;

use Log\Logger;
use Log\LogChannels;

class OfficeGroup implements \Auth\Users\Group{
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
        if(is_null($this->Members)) $this->FetchMembers();
        return $this->Members;
    }

    protected function FetchData(){
        if(is_null($this->Id) || $this->Id === 0){
            $this->PopulateDefaults();
            return;
        }

        $url = 'https://graph.microsoft.com/v1.0/groups/'.$this->Id.'/';

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

    protected function FetchMembers(){
        if($this->GetId() === 0){
            $this->Members = [];
            return;
        }

        $url = 'https://graph.microsoft.com/v1.0/groups/'.$this->GetId().'/members';

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
            Logger::Log('Nie udało się pobrać informacji o członkach grupy z serwera Office 365.', LogChannels::EXTERNAL_API);
            throw new \Exception('Nie udało się pobrać informacji o członkach grupy z serwera Office 365.');
        }

        $parsed = json_decode($result, true);

        $members = [];
        foreach($parsed['value'] as $group){
            $members[] = new OfficeUser($group['id'], $group['givenName'], $group['surname']);
        }
        $this->Members = $members;
    }

    protected function PopulateDefaults(){
        $this->Id = 0;
        $this->Name = 'Nieznana grupa – błąd ładowania';
    }

    public static /* Group[] */ function GetAll(){
        $url = 'https://graph.microsoft.com/v1.0/groups/';

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
            Logger::Log('Nie udało się pobrać informacji o grupach z serwera Office 365.', LogChannels::EXTERNAL_API);
            throw new \Exception('Nie udało się pobrać informacji o grupach z serwera Office 365.');
        }

        $parsed = json_decode($result, true);

        $groups = [];
        foreach($parsed['value'] as $group){
            $groups[] = new self($group['id'], $group['displayName']);
        }
        return $groups;
    }
}
?>