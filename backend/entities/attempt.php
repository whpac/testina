<?php
namespace Entities;

use Database\DatabaseManager;
use Log\Logger;
use Log\LogChannels;

define('TABLE_ATTEMPTS', 'attempts');

class Attempt extends Entity {
    protected /* int */ $id;
    protected /* int */ $user_id;
    protected /* int */ $assignment_id;
    protected /* float */ $score;
    protected /* float */ $max_score;
    protected /* DateTime */ $begin_time;
    protected /* int */ $is_finished;

    protected static /* string */ function GetTableName(){
        return TABLE_ATTEMPTS;
    }

    protected static /* bool */ function AllowsDeferredFetch(){
        return true;
    }

    protected /* void */ function OnPopulate(){
        $this->begin_time = \DateTime::createFromFormat('Y-m-d H:i:s', $this->begin_time);

        settype($this->id, 'int');
        settype($this->user_id, 'int');
        settype($this->assignment_id, 'int');
        settype($this->score, 'float');
        settype($this->max_score, 'float');
        settype($this->is_finished, 'int');
    }

    public /* int */ function GetId(){
        $this->FetchIfNeeded($this->id);
        return $this->id;
    }

    public /* User */ function GetUser(){
        $this->FetchIfNeeded();
        return new User($this->user_id);
    }

    public /* Assignment */ function GetAssignment(){
        $this->FetchIfNeeded();
        return new Assignment($this->assignment_id);
    }

    public /* float */ function GetScore(){
        $this->FetchIfNeeded();
        return $this->score;
    }

    public /* float */ function GetMaxScore(){
        $this->FetchIfNeeded();
        return $this->max_score;
    }

    public /* DateTime */ function GetBeginTime(){
        $this->FetchIfNeeded();
        return $this->begin_time;
    }

    public /* int */ function GetPercentageScore(){
        if($this->GetMaxScore() == 0) return null;
        return round(100 * ($this->GetScore() / $this->GetMaxScore()));
    }

    public static /* Attempt */ function Create(User $user, Assignment $assignment, \DateTime $begin_time = null, $score = 0, $max_score = 0){
        if(is_null($begin_time)) $begin_time = new \DateTime();
        
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_ATTEMPTS)
                ->Insert()
                ->Value('user_id', $user->GetId())
                ->Value('assignment_id', $assignment->GetId())
                ->Value('score', $score)
                ->Value('max_score', $max_score)
                ->Value('begin_time', $begin_time->format('Y-m-d H:i:s'))
                ->Value('is_finished', 0)
                ->Run();
        
        if($result === false){
            Logger::Log('Nie udało się rozpocząć podejścia: '.DatabaseManager::GetProvider()->GetError(), LogChannels::DATABASE);
            throw new \Exception('Nie udało się rozpocząć podejścia');
        }

        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_ATTEMPTS)
                ->Select()
                ->Where('user_id', '=', $user->GetId())
                ->OrderBy('id', 'DESC')
                ->Run();

        return new Attempt($result->fetch_assoc());
    }

    public static /* Attempt */ function GetAttemptsByUserAndAssignment(User $user, Assignment $assignment, bool $include_unfinished = false){
        $is_survey = $assignment->GetTest()->GetType() == Test::TYPE_SURVEY;

        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_ATTEMPTS)
                ->Select()
                ->Where('user_id', '=', $user->GetId())
                ->AndWhere('assignment_id', '=', $assignment->GetId());
        if($is_survey && !$include_unfinished) $result = $result->AndWhere('is_finished', '=', 1);
        $result = $result->Run();

        $attempts = [];
        for($i=0; $i<$result->num_rows; $i++){
            $attempts[] = new Attempt($result->fetch_assoc());
        }

        return $attempts;
    }

    public static /* int */ function CountAttemptsByUserAndAssignment(User $user, Assignment $assignment){
        $is_survey = $assignment->GetTest()->GetType() == Test::TYPE_SURVEY;

        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_ATTEMPTS)
                ->Select()
                ->Where('user_id', '=', $user->GetId())
                ->AndWhere('assignment_id', '=', $assignment->GetId());
        if($is_survey) $result = $result->AndWhere('is_finished', '=', 1);
        $result = $result->Run();
                
        return $result->num_rows;
    }

    public static /* ?Attempt */ function GetLastAttemptByUserAndAssignment(User $user, Assignment $assignment){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_ATTEMPTS)
                ->Select()
                ->Where('user_id', '=', $user->GetId())
                ->AndWhere('assignment_id', '=', $assignment->GetId())
                ->OrderBy('begin_time', 'DESC')
                ->Run();
        
        if($result->num_rows == 0) return null;
        return new Attempt($result->fetch_assoc());
    }

    public /* UserAnswerCollection */ function GetUserAnswers(){
        return UserAnswer::GetUserAnswersForAttempt($this);
    }

    public /* void */ function UpdateScore($got, $max){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_ATTEMPTS)
                ->Update()
                ->Set('score', $got)
                ->Set('max_score', $max)
                ->Where('id', '=', $this->GetId())
                ->Run();

        if($result === false){
            Logger::Log('Nie udało się zaktualizować wyniku w podejściu: '.DatabaseManager::GetProvider()->GetError(), LogChannels::DATABASE);
            throw new \Exception('Nie udało się zaktualizować wyniku w podejściu.');
        }

    }

    public /* void */ function Remove(){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_ATTEMPTS)
                ->Delete()
                ->Where('id', '=', $this->GetId())
                ->Run();

        if($result === false){
            Logger::Log('Nie udało się usunąć podejścia: '.DatabaseManager::GetProvider()->GetError(), LogChannels::DATABASE);
            throw new \Exception('Nie udało się usunąć podejścia.');
        }
    }

    public /* void */ function MarkAsFinished(){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_ATTEMPTS)
                ->Update()
                ->Set('is_finished', 1)
                ->Where('id', '=', $this->GetId())
                ->Run();
        
        if($result === false){
            Logger::Log('Nie udało się oznaczyć podejścia jako ukończonego: '.DatabaseManager::GetProvider()->GetError(), LogChannels::DATABASE);
            throw new \Exception('Nie udało się oznaczyć podejścia jako ukończonego.');
        }
    }
}
?>