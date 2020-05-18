<?php
namespace Entities;

use \UEngine\Modules\Core\RichException;
use \UEngine\Modules\Core\Database\DatabaseManager;

define('TABLE_ANSWERS', 'answers');

class Answer extends Entity {
    protected /* int */ $id;
    protected /* int */ $question_id;
    protected /* string */ $text;
    protected /* int */ $flags;       // flags & 1 = correct

    protected static /* string */ function GetTableName(){
        return TABLE_ANSWERS;
    }

    protected static /* bool */ function AllowsDeferredFetch(){
        return true;
    }

    protected /* void */ function OnPopulate(){
        settype($this->id, 'int');
        settype($this->question_id, 'int');
        settype($this->flags, 'int');
    }

    public /* int */ function GetId(){
        $this->FetchIfNeeded($this->id);
        return $this->id;
    }

    public /* Question */ function GetQuestion(){
        $this->FetchIfNeeded();
        return new Question($this->question_id);
    }

    public /* string */ function GetText(){
        $this->FetchIfNeeded();
        return $this->text;
    }

    protected /* int */ function GetFlags(){
        $this->FetchIfNeeded();
        return $this->flags;
    }

    public /* bool */ function IsCorrect(){
        return ($this->GetFlags() & 1) == 1;
    }

    public static /* Answer[] */ function GetAnswersForQuestion(Question $question){
        $answers = [];
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_ANSWERS)
                ->Select()
                ->Where('question_id', '=', $question->GetId())
                ->Run();
        
        for($i=0; $i<$result->num_rows; $i++){
            $row = $result->fetch_assoc();
            $answers[] = new Answer($row);
        }

        return $answers;
    }
}
?>