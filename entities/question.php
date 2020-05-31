<?php
namespace Entities;

use \UEngine\Modules\Core\RichException;
use \UEngine\Modules\Core\Database\DatabaseManager;

define('TABLE_QUESTIONS', 'questions');

class Question extends Entity {
    protected /* int */ $id;
    protected /* int */ $test_id;
    protected /* string */ $text;
    protected /* int */ $type;
    protected /* float */ $points;
    protected /* int */ $points_counting;

    const TYPE_SINGLE_CHOICE = 0;
    const TYPE_MULTI_CHOICE = 1;
    const TYPE_OPEN_ANSWER = 2;

    const COUNTING_LINEAR = 0;
    const COUNTING_BINARY = 1;

    protected static /* string */ function GetTableName(){
        return TABLE_QUESTIONS;
    }

    protected static /* bool */ function AllowsDeferredFetch(){
        return true;
    }

    protected /* void */ function OnPopulate(){
        settype($this->id, 'int');
        settype($this->test_id, 'int');
        settype($this->type, 'int');
        settype($this->points, 'float');
        settype($this->points_counting, 'int');
    }

    public /* int */ function GetId(){
        $this->FetchIfNeeded($this->id);
        return $this->id;
    }

    public /* Test */ function GetTest(){
        $this->FetchIfNeeded();
        return new Test($this->test_id);
    }

    public /* string */ function GetText(){
        $this->FetchIfNeeded();
        return $this->text;
    }

    public /* int */ function GetType(){
        $this->FetchIfNeeded();
        return $this->type;
    }

    public /* float */ function GetPoints(){
        $this->FetchIfNeeded();
        return $this->points;
    }

    public /* int */ function GetPointsCounting(){
        $this->FetchIfNeeded();
        return $this->points_counting;
    }

    public /* Answer[] */ function GetAnswers(){
        return Answer::GetAnswersForQuestion($this);
    }

    public static /* Question[] */ function GetQuestionsForTest(Test $test){
        $questions = [];
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_QUESTIONS)
                ->Select()
                ->Where('test_id', '=', $test->GetId())
                ->Run();
        
        for($i=0; $i<$result->num_rows; $i++){
            $row = $result->fetch_assoc();
            $questions[] = new Question($row);
        }

        return $questions;
    }

    public /* bool */ function Update(/* string? */ $text = null, /* int? */ $type = null, /* float? */ $points = null, /* int? */ $points_counting = null){
        if(is_null($text)) $text = $this->text;
        if(is_null($type)) $type = $this->type;
        if(is_null($points)) $points = $this->points;
        if(is_null($points_counting)) $points_counting = $this->points_counting;

        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_QUESTIONS)
                ->Update()
                ->Set('text', $text)
                ->Set('type', $type)
                ->Set('points', $points)
                ->Set('points_counting', $points_counting)
                ->Where('id', '=', $this->id)
                ->Run();
        
        return $result;
    }

    public /* bool */ function Remove(){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_QUESTIONS)
                ->Delete()
                ->Where('id', '=', $this->id)
                ->Run();

        return $result;
    }

    public static /* Question */ function Create(/* Test */ $test, /* string */ $text, /* int */ $type, /* float */ $points, /* int */ $points_counting){
        if(is_null($text)) throw new RichExcpetion('Treść pytania nie może być null.');
        if(is_null($type)) throw new RichExcpetion('Typ pytania nie może być null.');
        if(is_null($points)) throw new RichExcpetion('Ilość punktów nie może być null.');
        if(is_null($points_counting)) throw new RichExcpetion('Metoda liczenia punktów nie może być null.');

        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_QUESTIONS)
                ->Insert()
                ->Value('test_id', $test->GetId())
                ->Value('text', $text)
                ->Value('type', $type)
                ->Value('points', $points)
                ->Value('points_counting', $points_counting)
                ->Run();
        
        if($result === false) throw new RichException('Nie udało się dodać pytania.');

        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_QUESTIONS)
                ->Select()
                ->OrderBy('id', 'DESC')
                ->Limit(1)
                ->Run();

        return new Question($result->fetch_assoc());
    }

    public /* float */ function CountPoints(/* UserAnswer[] */ array $user_answers){
        foreach($user_answers as $user_answer){
            if($user_answer->IsNoAnswer()) return 0;
        }

        switch($this->GetType()){
            case self::TYPE_SINGLE_CHOICE:
                return $this->CountPointsMultiChoice($user_answers);
            break;
            case self::TYPE_MULTI_CHOICE:
                return $this->CountPointsMultiChoice($user_answers);
            break;
        }
        return null;
    }

    public /* float */ function CountPointsMultiChoice(/* UserAnswer[] */ array $user_answers){
        $selected_ids = [];
        $correct_ids = [];

        foreach($user_answers as $user_answer){
            $selected_ids[] = $user_answer->GetAnswer()->GetId();
        }

        $answers = $this->GetAnswers();
        foreach($answers as $answer){
            if($answer->IsCorrect()) $correct_ids[] = $answer->GetId();
        }

        switch($this->GetPointsCounting()){
            case self::COUNTING_LINEAR:
                return $this->CountPointsMultiChoiceLinear($selected_ids, $correct_ids);
            break;
            case self::COUNTING_BINARY:
                return $this->CountPointsMultiChoiceBinary($selected_ids, $correct_ids);
            break;
        }
        return null;
    }

    protected /* float */ function CountPointsMultiChoiceLinear(array $selected_ids, array $correct_ids){
        $wrong_answers = 0;

        foreach($selected_ids as $selected_id){
            if(!in_array($selected_id, $correct_ids)) $wrong_answers++;
        }

        foreach($correct_ids as $correct_id){
            if(!in_array($correct_id, $selected_ids)) $wrong_answers++;
        }

        $points = $this->GetPoints();
        $points *= 1 - ($wrong_answers / count($correct_ids));
        if($points < 0) $points = 0;
        return $points;
    }

    protected /* float */ function CountPointsMultiChoiceBinary(array $selected_ids, array $correct_ids){
        if(count($selected_ids) != count($correct_ids)) return 0;
        
        foreach($selected_ids as $selected_id){
            if(!in_array($selected_id, $correct_ids)) return 0;
        }

        foreach($correct_ids as $correct_id){
            if(!in_array($correct_id, $selected_ids)) return 0;
        }

        return $this->GetPoints();
    }
}
?>