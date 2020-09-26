<?php
namespace Entities;

use Database\DatabaseManager;
use Log\Logger;
use Log\LogChannels;

define('TABLE_ATTEMPTS', 'attempts');

class Attempt extends Entity {
    protected /* int */ $id;
    protected /* string */ $user_id;
    protected /* int */ $assignment_id;
    protected /* float */ $score;
    protected /* float */ $max_score;
    protected /* DateTime */ $begin_time;

    protected static /* string */ function GetTableName(){
        return TABLE_ATTEMPTS;
    }

    protected static /* bool */ function AllowsDeferredFetch(){
        return true;
    }

    protected /* void */ function OnPopulate(){
        $this->begin_time = \DateTime::createFromFormat('Y-m-d H:i:s', $this->begin_time);

        settype($this->id, 'int');
        settype($this->assignment_id, 'int');
        settype($this->score, 'float');
        settype($this->max_score, 'float');
    }

    public /* int */ function GetId(){
        $this->FetchIfNeeded($this->id);
        return $this->id;
    }

    public /* User */ function GetUser(){
        $this->FetchIfNeeded();
        return new \Auth\ExternalLogin\OfficeUser($this->user_id);
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

    public static /* Attempt */ function Create(\Auth\Users\User $user, Assignment $assignment, \DateTime $begin_time = null, $score = 0, $max_score = 0){
        if(is_null($begin_time)) $begin_time = new \DateTime();
        
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_ATTEMPTS)
                ->Insert()
                ->Value('user_id', $user->GetId())
                ->Value('assignment_id', $assignment->GetId())
                ->Value('score', $score)
                ->Value('max_score', $max_score)
                ->Value('begin_time', $begin_time->format('Y-m-d H:i:s'))
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

    public static /* Attempt */ function GetAttemptsByUserAndAssignment(\Auth\Users\User $user, Assignment $assignment){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_ATTEMPTS)
                ->Select()
                ->Where('user_id', '=', $user->GetId())
                ->AndWhere('assignment_id', '=', $assignment->GetId())
                ->Run();
                
        $attempts = [];
        for($i=0; $i<$result->num_rows; $i++){
            $attempts[] = new Attempt($result->fetch_assoc());
        }

        return $attempts;
    }

    public static /* int */ function CountAttemptsByUserAndAssignment(\Auth\Users\User $user, Assignment $assignment){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_ATTEMPTS)
                ->Select()
                ->Where('user_id', '=', $user->GetId())
                ->AndWhere('assignment_id', '=', $assignment->GetId())
                ->Run();
                
        return $result->num_rows;
    }

    public static /* ?Attempt */ function GetLastAttemptByUserAndAssignment(\Auth\Users\User $user, Assignment $assignment){
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
        DatabaseManager::GetProvider()
                ->Query('UPDATE '.TABLE_ATTEMPTS.' SET score='.$got.', max_score='.$max.' WHERE id='.$this->GetId());
    }

    public /* void */ function Remove(){
        DatabaseManager::GetProvider()
                ->Query('DELETE FROM '.TABLE_ATTEMPTS.' WHERE id='.$this->GetId());
    }
}
?>