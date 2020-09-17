<?php
namespace Log;

class LogChannels{
    // Ogólny kanał dziennika
    public const GENERAL = 0;

    // Kanały związane z walidacją danych
    public const VALIDATION_GENERAL = 1;
    public const VALIDATION_TYPE_MISMATCH = 2;
    public const VALIDATION_OUT_OF_BOUNDS = 3;

    // Kanały związane z logowaniem
    public const AUTHORIZATION_SUCCESS = 10;
    public const AUTHORIZATION_FAILED = 11;
    public const AUTHORIZATION_LOG_OUT = 12;
    public const AUTHORIZATION_EXTERNAL_ERROR = 13;

    // Kanały związane z kontrolą dostępu
    public const SESSION_FAILURE = 20;
    public const ACCESS_FORBIDDEN = 21;

    // Ogólne błędy zgłoszone w aplikacji
    public const APPLICATION_ERROR = 30;

    // Kanał dla zdarzeń podwyższonego ryzyka
    public const SUDO_MODE = 40;

    // Kanał dla wiadomości związanych z bazą danych
    public const DATABASE = 50;
}
?>