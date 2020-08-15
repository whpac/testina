<?php
namespace Entities;

use \UEngine\Modules\Core\RichException;
use Database\DatabaseManager;

define('TABLE_TESTS', 'tests');

class Test extends Entity{
    protected /* int */ $id;
    protected /* string */ $name;
    protected /* int */ $author_id;
    protected /* DateTime */ $creation_date;
    protected /* int */ $time_limit;
    protected /* float */ $question_multiplier;

    protected static /* string */ function GetTableName(){
        return TABLE_TESTS;
    }

    protected static /* bool */ function AllowsDeferredFetch(){
        return true;
    }

    protected /* void */ function OnPopulate(){
        settype($this->id, 'int');
        settype($this->author_id, 'int');
        settype($this->question_multiplier, 'float');
        settype($this->time_limit, 'int');

        $this->creation_date = \DateTime::createFromFormat('Y-m-d H:i:s', $this->creation_date);
    }

    public /* int */ function GetId(){
        $this->FetchIfNeeded($this->id);
        return $this->id;
    }

    public /* string */ function GetName(){
        $this->FetchIfNeeded();
        return $this->name;
    }

    public /* User */ function GetAuthor(){
        $this->FetchIfNeeded();
        return new User($this->author_id);
    }

    public /* DateTime */ function GetCreationDate(){
        $this->FetchIfNeeded();
        return $this->creation_date;
    }

    public /* int */ function GetTimeLimit(){
        $this->FetchIfNeeded();
        return $this->time_limit;
    }

    public /* bool */ function HasTimeLimit(){
        return $this->GetTimeLimit() != 0;
    }

    public /* float */ function GetQuestionMultiplier(){
        $this->FetchIfNeeded();
        return $this->question_multiplier;
    }

    public /* Question[] */ function GetQuestions(){
        return Question::GetQuestionsForTest($this);
    }

    public /* int */ function GetQuestionCount(){
        return round($this->GetQuestionMultiplier() * count($this->GetQuestions()));
    }

    public /* int */ function GetAssignmentCount(){
        return Assignment::CountForTest($this);
    }

    public /* Assignment[] */ function GetAssignments(){
        return Assignment::GetForTest($this);
    }

    public /* bool */ function IsMadeByUser(User $user){
        return $this->GetAuthor()->GetId() == $user->GetId();
    }

    public static /* Test[] */ function GetTestsCreatedByUser(User $user){
        $tests = [];
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_TESTS)
                ->Select()
                ->Where('author_id', '=', $user->GetId())
                ->Run();

        for($i=0; $i<$result->num_rows; $i++){
            $row = $result->fetch_assoc();
            $tests[] = new Test($row);
        }

        return $tests;
    }

    public static /* bool */ function Exists($id){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_TESTS)
                ->Select(['id'])
                ->Where('id', '=', $id)
                ->Run();

        return ($result->num_rows == 1);
    }

    public /* bool */ function Update(/* string? */ $name = null, /* float? */ $question_multiplier = null, /* int? */ $time_limit = null){
        if(is_null($name)) $name = $this->GetName();
        if(is_null($question_multiplier)) $question_multiplier = $this->GetQuestionMultiplier();
        if(is_null($time_limit)) $time_limit = $this->GetTimeLimit();

        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_TESTS)
                ->Update()
                ->Set('name', $name)
                ->Set('question_multiplier', $question_multiplier)
                ->Set('time_limit', $time_limit)
                ->Where('id', '=', $this->id)
                ->Run();
        
        return $result === true;
    }

    public static /* Test */ function Create(User $author, /* string */ $name = 'Test bez nazwy', /* int */ $time_limit = 0, /* float */ $question_multiplier = 1){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_TESTS)
                ->Insert()
                ->Value('name', $name)
                ->Value('author_id', $author->GetId())
                ->Value('creation_date', (new \DateTime())->format('Y-m-d H:i:s'))
                ->Value('time_limit', $time_limit)
                ->Value('question_multiplier', $question_multiplier)
                ->Run();
            
        if($result === false)
            throw new RichException('Nie udało się stworzyć testu.');
        
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_TESTS)
                ->Select()
                ->OrderBy('id', 'DESC')
                ->Limit(1)
                ->Run();
        
        if($result === false || $result->num_rows == 0)
            throw new RichException('Nie udało się wczytać utworzonego właśnie testu.');

        return new Test($result->fetch_assoc());
    }

    public /* bool */ function Remove(){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_TESTS)
                ->Delete()
                ->Where('id', '=', $this->GetId())
                ->Run();
        
        return $result === true;
    }
}
?>