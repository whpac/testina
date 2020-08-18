<?php
namespace Log;

use Database\DatabaseManager;
use Session\SessionManager;

define('TABLE_LOG', 'log');

class Logger{

    public static function Log(string $message, $channel){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_LOG)
                ->Insert()
                ->Value('message', $message)
                ->Value('channel', $channel)
                ->Value('date', (new \DateTime())->format('Y-m-d H:i:s'))
                ->Value('session_id', SessionManager::GetSessionId())
                ->Run();

        if($result === false) throw new \Exception('Nie można zapisać wpisu w logach.');
    }
}
?>