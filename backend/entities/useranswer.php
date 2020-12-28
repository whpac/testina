<?php
namespace Entities;

use Database\DatabaseManager;
use Log\Logger;
use Log\LogChannels;

define('TABLE_USER_ANSWERS', 'user_answers');

class UserAnswer extends Entity {
    protected /* int */ $id;
    protected /* int */ $attempt_id;
    protected /* int */ $answer_id;
    protected /* int */ $question_index;
    protected /* int */ $question_id;
    protected /* string */ $supplied_answer;
    protected /* float */ $score_got;

    protected static /* string */ function GetTableName(){
        return TABLE_USER_ANSWERS;
    }

    protected static /* bool */ function AllowsDeferredFetch(){
        return true;
    }

    protected /* void */ function OnPopulate(){
        settype($this->id, 'int');
        settype($this->attempt_id, 'int');
        settype($this->answer_id, 'int');
        settype($this->question_index, 'int');
        settype($this->supplied_answer, 'string');
    }

    public /* int */ function GetId(){
        $this->FetchIfNeeded($this->id);
        return $this->id;
    }

    public /* Attempt */ function GetAttempt(){
        $this->FetchIfNeeded();
        return new Attempt($this->attempt_id);
    }

    public /* Answer? */ function GetAnswer(){
        $this->FetchIfNeeded();
        if(is_null($this->answer_id)) return null;
        if($this->answer_id <= 0) return $this->answer_id;
        return new Answer($this->answer_id);
    }

    public /* int */ function GetQuestionIndex(){
        $this->FetchIfNeeded();
        return $this->question_index;
    }

    public /* Question */ function GetQuestion(){
        $this->FetchIfNeeded();
        return new Question($this->question_id);
    }

    public /* string? */ function GetSuppliedAnswer(){
        $this->FetchIfNeeded();
        return $this->supplied_answer;
    }

    public /* float */ function GetScore(){
        $this->FetchIfNeeded();
        return $this->score_got;
    }

    public /* bool */ function IsOpenAnswer(){
        return !($this->GetSuppliedAnswer() === '' || is_null($this->GetSuppliedAnswer()));
    }

    public /* bool */ function IsNoAnswer(){
        return is_null($this->GetAnswer()) && !$this->IsOpenAnswer();
    }

    public static function Create(Attempt $attempt, Answer $answer, /* int */ $question_index){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_USER_ANSWERS)
                ->Insert()
                ->Value('attempt_id', $attempt->GetId())
                ->Value('answer_id', $answer->GetId())
                ->Value('question_index', $question_index)
                ->Value('question_id', $answer->GetQuestion()->GetId())
                ->Value('score_got', 0)
                ->Run();

        if($result === false){
            Logger::Log('Nie udało się zapisać odpowiedzi: '.DatabaseManager::GetProvider()->GetError());
            throw new \Exception('Nie udało się zapisać odpowiedzi.');
        }

        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_USER_ANSWERS)
                ->Select(['id'])
                ->Where('attempt_id', '=', $attempt->GetId())
                ->OrderBy('id', 'DESC')
                ->Run();

        return new UserAnswer($result->fetch_assoc());
    }

    public static function CreateOpenAnswer(Attempt $attempt, /* int */ $question_index, Question $question, string $answer){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_USER_ANSWERS)
                ->Insert()
                ->Value('attempt_id', $attempt->GetId())
                ->Value('question_index', $question_index)
                ->Value('question_id', $question->GetId())
                ->Value('supplied_answer', $answer)
                ->Value('score_got', 0)
                ->Run();

        if($result === false){
            Logger::Log('Nie udało się zapisać odpowiedzi: '.DatabaseManager::GetProvider()->GetError());
            throw new \Exception('Nie udało się zapisać odpowiedzi.');
        }

        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_USER_ANSWERS)
                ->Select(['id'])
                ->Where('attempt_id', '=', $attempt->GetId())
                ->OrderBy('id', 'DESC')
                ->Run();

        return new UserAnswer($result->fetch_assoc());
    }

    public static function CreateNoAnswer(Attempt $attempt, /* int */ $question_index, Question $question){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_USER_ANSWERS)
                ->Insert()
                ->Value('attempt_id', $attempt->GetId())
                ->Value('question_index', $question_index)
                ->Value('question_id', $question->GetId())
                ->Value('score_got', 0)
                ->Run();

        if($result === false){
            Logger::Log('Nie udało się zapisać odpowiedzi: '.DatabaseManager::GetProvider()->GetError());
            throw new \Exception('Nie udało się zapisać odpowiedzi.');
        }

        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_USER_ANSWERS)
                ->Select(['id'])
                ->Where('attempt_id', '=', $attempt->GetId())
                ->OrderBy('id', 'DESC')
                ->Run();

        return new UserAnswer($result->fetch_assoc());
    }

    public static function CreateSpecialAnswer(Attempt $attempt, /* int */ $answer_id, /* int */ $question_index, Question $question){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_USER_ANSWERS)
                ->Insert()
                ->Value('attempt_id', $attempt->GetId())
                ->Value('answer_id', $answer_id)
                ->Value('question_index', $question_index)
                ->Value('question_id', $question->GetId())
                ->Value('score_got', 0)
                ->Run();

        if($result === false){
            Logger::Log('Nie udało się zapisać odpowiedzi: '.DatabaseManager::GetProvider()->GetError());
            throw new \Exception('Nie udało się zapisać odpowiedzi.');
        }

        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_USER_ANSWERS)
                ->Select(['id'])
                ->Where('attempt_id', '=', $attempt->GetId())
                ->OrderBy('id', 'DESC')
                ->Run();

        return new UserAnswer($result->fetch_assoc());
    }

    public static function SaveScoreForQuestion(Attempt $attempt, $question_index, $score){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_USER_ANSWERS)
                ->Update()
                ->Set('score_got', $score)
                ->Where('attempt_id', '=', $attempt->GetId())
                ->Where('question_index', '=', $question_index)
                ->Run();
        
        if($result === false){
            Logger::Log('Nie udało się zapisać punktacji do pytania: '.DatabaseManager::GetProvider()->GetError(), LogChannels::DATABASE);
            return false;
        }
        return true;
    }

    public static /* UserAnswerCollection */ function GetUserAnswersForAttempt(Attempt $attempt){
        $user_answers = new UserAnswerCollection();
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_USER_ANSWERS)
                ->Select()
                ->Where('attempt_id', '=', $attempt->GetId())
                ->Run();
        
        if($result === false){
            throw new \Exception('Nie udało się wczytać odpowiedzi.');
        }
        
        for($i=0; $i<$result->num_rows; $i++){
            $row = $result->fetch_assoc();
            $user_answers->Add(new UserAnswer($row));
        }

        return $user_answers;
    }

    public static /* float */ function GetScoreForAttemptAndQuestionIndex(Attempt $attempt, $question_index){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_USER_ANSWERS)
                ->Select()
                ->Where('attempt_id', '=', $attempt->GetId())
                ->Where('question_index', '=', $question_index)
                ->Run();
        
        if($result === false || $result->num_rows == 0){
            throw new \Exception('Nie udało się odczytać wyniku pytania.');
        }

        return $result->fetch_assoc()['score_got'];
    }
}
?>