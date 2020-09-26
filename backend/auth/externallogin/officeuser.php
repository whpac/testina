<?php
namespace Auth\ExternalLogin;

use Log\Logger;
use Log\LogChannels;

class OfficeUser extends ExternalUser {
    protected $Id = null;
    protected $FirstName = null;
    protected $LastName = null;

    public function GetId(){
        if(is_null($this->Id)) $this->FetchData();
        return $this->Id;
    }

    public function GetFirstName(){
        if(is_null($this->FirstName)) $this->FetchData();
        return $this->FirstName;
    }

    public function GetLastName(){
        if(is_null($this->LastName)) $this->FetchData();
        return $this->LastName;
    }

    protected function FetchData(){
        $url = 'https://graph.microsoft.com/v1.0/me/';

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

    public function __toString(){
        try{
            return $this->GetFirstName().' '.$this->GetLastName().' ('.$this->GetId().')';
        }catch(\Exception $e){
            return 'Użytkownik Office (błąd wczytywania)';
        }
    }
}
?>