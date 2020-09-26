<?php
namespace Auth\ExternalLogin;

use Database\DatabaseManager;
use Log\Logger;
use Log\LogChannels;
use Session\SessionManager;

define('TABLE_TOKENS', 'tokens');

class TokenManager{
    const TOKEN_TYPE_ACCESS = 0;
    const TOKEN_TYPE_REFRESH = 1;

    /**
     * Rejestruje token dostępu, nadpisując poprzedni (jeśli istniał)
     * @param $access_token Nowy token dostępu
     * @param $expires_in Czas, po którym token dostępu wygaśnie
     */
    public static function RegisterAccessToken(string $access_token, int $expires_in): void{
        $expire_date = (new \DateTime())->add(new \DateInterval('PT'.$expires_in.'S'));
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_TOKENS)
                ->Replace()
                ->Value('session_id', SessionManager::GetSessionId())
                ->Value('token_type', self::TOKEN_TYPE_ACCESS)
                ->Value('token', $access_token)
                ->Value('expire_date', $expire_date->format('Y-m-d H:i:s'))
                ->Run();
        
        if($result === false){
            Logger::Log('Nie udało się zapisać tokenu dostępu w bazie danych: '.DatabaseManager::GetProvider()->GetError(), LogChannels::DATABASE);
            throw new \Exception('Nie udało się zapisać poświadczeń pobranych z serwera.');
        }
    }

    /**
     * Zwraca token dostępu. Jeśli już wygasł, próbuje utworzyć nowy. Kiedy to się nie uda - zwraca null
     */
    public static function GetAccessToken(): ?string{
        return null;
    }

    /**
     * Rejestruje token odświeżania, nadpisując poprzedni (jeśli istniał)
     * @param $refresh_token Nowy token odświeżania
     */
    public static function RegisterRefreshToken(string $refresh_token): void{
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_TOKENS)
                ->Replace()
                ->Value('session_id', SessionManager::GetSessionId())
                ->Value('token_type', self::TOKEN_TYPE_REFRESH)
                ->Value('token', $refresh_token)
                ->Value('expire_date', SessionManager::GetExpireTime()->format('Y-m-d H:i:s'))
                ->Run();
        
        if($result === false){
            Logger::Log('Nie udało się zapisać tokenu odświeżania w bazie danych: '.DatabaseManager::GetProvider()->GetError(), LogChannels::DATABASE);
            throw new \Exception('Nie udało się zapisać poświadczeń pobranych z serwera.');
        }
    }

    /**
     * Wymienia kod autoryzacji na tokeny dostępu i odświeżania
     */
    public static function ExchangeAuthorizationCodeIntoTokens(string $authorization_code): TokenResponse{
        $url = 'https://login.microsoftonline.com/organizations/oauth2/v2.0/token';
        $data = [
            'client_id' => CRED_OFFICE_CLIENT_ID,
            'scope' => 'offline_access user.read',
            'code' => $authorization_code,
            'redirect_uri' => 'http://localhost/p/office_login',
            'grant_type' => 'authorization_code',
            'client_secret' => CRED_OFFICE_CLIENT_SECRET
        ];

        // Opcje żądania
        $options = array(
            'http' => array(
                'header'  => "Content-Type: application/x-www-form-urlencoded\r\n",
                'method'  => 'POST',
                'content' => http_build_query($data)
            )
        );

        // Wykonaj żądanie
        $context  = stream_context_create($options);
        $result = file_get_contents($url, false, $context);
        if ($result === false) {
            Logger::Log('Nie udało się pobrać informacji o logowaniu z serwera Office 365.', LogChannels::AUTHORIZATION_EXTERNAL_ERROR);
            throw new \Exception('Nie udało się pobrać informacji o logowaniu z serwera Office 365.');
        }

        // Przetwórz odpowiedź - pobierz tokeny i czas wygaśnięcia
        $decoded_result = json_decode($result);
        $response = new TokenResponse();
        $response->AccessToken = $decoded_result->access_token;
        $response->RefreshToken = null;
        if(isset($decoded_result->refresh_token)) $response->RefreshToken = $decoded_result->refresh_token;
        $response->ExpiresIn = $decoded_result->expires_in;

        return $response;
    }

    /**
     * Usuwa wszystkie nieaktualne tokeny z bazy danych
     */
    public static function RemoveExpiredTokens(){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_TOKENS)
                ->Delete()
                ->Where('expire_date', '<', (new \DateTime())->format('Y-m-d H:i:s'))
                ->Run();
        
        if($result === false){
            Logger::Log('Nie udało się usunąć niektualnych tokenów z bazy danych: '.DatabaseManager::GetProvider()->GetError(), LogChannels::DATABASE);
            throw new \Exception('Nie udało się odświeżyć poświadczeń pobranych z serwera zdalnego.');
        }
    }
}
?>