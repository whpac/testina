<?php
namespace Auth\ExternalLogin;

use Log\Logger;
use Log\LogChannels;

class OfficeUser extends ExternalUser {
    protected $Id = null;
    protected $FirstName = null;
    protected $LastName = null;

    public function __construct(?string $id = null){
        $this->Id = $id;
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
        return [];
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

        $url = 'https://graph.microsoft.com/v1.0/'.$resource.'/';

        // Opcje żądania
        $options = array(
            'http' => array(
                'header'  => "Authorization: Bearer ".TokenManager::GetAccessToken()."\r\n",
                'method'  => 'GET',
            )
        );

        // Wykonaj żądanie
        $context = stream_context_create($options);
        $result = file_get_contents($url, false, $context);
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

    public function __toString(){
        try{
            return $this->GetFirstName().' '.$this->GetLastName().' ('.$this->GetId().')';
        }catch(\Exception $e){
            return 'Użytkownik Office (błąd wczytywania)';
        }
    }
}
?>