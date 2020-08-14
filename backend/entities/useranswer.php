<?php
namespace Entities;

use \UEngine\Modules\Core\RichException;
use Database\DatabaseManager;

define('TABLE_USER_ANSWERS', 'user_answers');

class UserAnswer extends Entity {
    protected /* int */ $id;
    protected /* int */ $attempt_id;
    protected /* int */ $answer_id;
    protected /* int */ $question_index;
    protected /* int */ $question_id;

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
    }

    public /* int */ function GetId(){
        $this->FetchIfNeeded($this->id);
        return $this->id;
    }

    public /* Attempt */ function GetAttempt(){
        $this->FetchIfNeeded();
        return new Attempt($this->attempt_id);
    }

    public /* Answer */ function GetAnswer(){
        $this->FetchIfNeeded();
        if(is_null($this->answer_id)) return null;
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

    public /* bool */ function IsNoAnswer(){
        return is_null($this->GetAnswer());
    }

    public static function Create(Attempt $attempt, Answer $answer, /* int */ $question_index){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_USER_ANSWERS)
                ->Insert()
                ->Value('attempt_id', $attempt->GetId())
                ->Value('answer_id', $answer->GetId())
                ->Value('question_index', $question_index)
                ->Value('question_id', $answer->GetQuestion()->GetId())
                ->Run();

        if($result === false) throw new RichException('Nie udało się zapisać odpowiedzi.');

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
                ->Run();

        if($result === false) throw new RichException('Nie udało się zapisać odpowiedzi.');

        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_USER_ANSWERS)
                ->Select(['id'])
                ->Where('attempt_id', '=', $attempt->GetId())
                ->OrderBy('id', 'DESC')
                ->Run();

        return new UserAnswer($result->fetch_assoc());
    }

    public static /* UserAnswerCollection */ function GetUserAnswersForAttempt(Attempt $attempt){
        $user_answers = new UserAnswerCollection();
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_USER_ANSWERS)
                ->Select()
                ->Where('attempt_id', '=', $attempt->GetId())
                ->Run();
        
        for($i=0; $i<$result->num_rows; $i++){
            $row = $result->fetch_assoc();
            $user_answers->Add(new UserAnswer($row));
        }

        return $user_answers;
    }
}
?>