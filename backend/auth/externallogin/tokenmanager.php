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

    const REQUESTED_SCOPES = 'offline_access user.read user.read.all';

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
     * Zwraca token dostępu. Jeśli już wygasł, próbuje utworzyć nowy. Kiedy to się nie uda - zgłasza wyjątek
     * @param $try_to_refresh Czy próbować odświeżania tokenu
     */
    public static function GetAccessToken(bool $try_to_refresh = true): ?string{
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_TOKENS)
                ->Select()
                ->Where('session_id', '=', SessionManager::GetSessionId())
                ->AndWhere('token_type', '=', self::TOKEN_TYPE_ACCESS)
                ->Run();

        if($result->num_rows < 1){
            return null;
        }

        $row = $result->fetch_assoc();
        if(new \DateTime($row['expire_date']) < new \DateTime()){
            if($try_to_refresh){
                self::TryToGetNewAccessToken();
                return self::GetAccessToken(false);
            }else{
                return null;
            }
        }

        return $row['token'];
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
     * Zwraca token odświeżania.
     */
    protected static function GetRefreshToken(): ?string{
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_TOKENS)
                ->Select()
                ->Where('session_id', '=', SessionManager::GetSessionId())
                ->AndWhere('token_type', '=', self::TOKEN_TYPE_REFRESH)
                ->Run();

        if($result->num_rows < 1){
            return null;
        }

        $row = $result->fetch_assoc();
        if(new \DateTime($row['expire_date']) < new \DateTime()){
            return null;
        }

        return $row['token'];
    }

    /**
     * Wymienia kod autoryzacji na tokeny dostępu i odświeżania
     */
    public static function ExchangeAuthorizationCodeIntoTokens(string $authorization_code): TokenResponse{
        $url = 'https://login.microsoftonline.com/organizations/oauth2/v2.0/token';
        $data = [
            'client_id' => CRED_OFFICE_CLIENT_ID,
            'scope' => self::REQUESTED_SCOPES,
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
        $result = @file_get_contents($url, false, $context);
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
    public static function RemoveExpiredTokens(): void{
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

    protected static function TryToGetNewAccessToken(): void{
        $refresh_token = self::GetRefreshToken();

        $url = 'https://login.microsoftonline.com/organizations/oauth2/v2.0/token';
        $data = [
            'client_id' => CRED_OFFICE_CLIENT_ID,
            'scope' => self::REQUESTED_SCOPES,
            'refresh_token' => $refresh_token,
            'redirect_uri' => 'http://localhost/p/office_login',
            'grant_type' => 'refresh_token',
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
        $result = @file_get_contents($url, false, $context);
        if ($result === false) {
            Logger::Log('Nie udało się pobrać informacji o logowaniu z serwera Office 365.', LogChannels::AUTHORIZATION_EXTERNAL_ERROR);
            throw new \Exception('Nie udało się pobrać informacji o logowaniu z serwera Office 365.');
        }

        // Przetwórz odpowiedź - pobierz tokeny i czas wygaśnięcia
        $decoded_result = json_decode($result);

        self::RegisterAccessToken($decoded_result->access_token, $decoded_result->expires_in);
        if(isset($decoded_result->refresh_token)) self::RegisterRefreshToken($decoded_result->refresh_token);
    }
}
?>