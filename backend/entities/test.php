<?php
namespace Entities;

use Database\DatabaseManager;
use Log\Logger;
use Log\LogChannels;

define('TABLE_TESTS', 'tests');

class Test extends Entity{
    protected /* int */ $id;
    protected /* string */ $name;
    protected /* string */ $author_id;
    protected /* DateTime */ $creation_date;
    protected /* int */ $time_limit;
    protected /* float */ $question_multiplier;
    protected /* ?string */ $description;
    protected /* ?string */ $access_key;
    protected /* int */ $type;

    const TYPE_TEST = 0;
    const TYPE_SURVEY = 1;

    protected static /* string */ function GetTableName(){
        return TABLE_TESTS;
    }

    protected static /* bool */ function AllowsDeferredFetch(){
        return true;
    }

    protected /* void */ function OnPopulate(){
        settype($this->id, 'int');
        settype($this->question_multiplier, 'float');
        settype($this->time_limit, 'int');
        settype($this->type, 'int');

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
        return new \Auth\ExternalLogin\OfficeUser($this->author_id);
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

    public /* ?string */ function GetDescription(){
        $this->FetchIfNeeded();
        return $this->description;
    }

    public /* ?string */ function GetAccessKey(){
        $this->FetchIfNeeded();
        return $this->access_key;
    }

    public /* int */ function GetType(){
        $this->FetchIfNeeded();
        return $this->type;
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

    public /* bool */ function IsMadeByUser(\Auth\Users\User $user){
        return $this->GetAuthor()->GetId() == $user->GetId();
    }

    public static /* Test[] */ function GetTestsCreatedByUser(\Auth\Users\User $user){
        return self::GetCreatedByUser($user, self::TYPE_TEST);
    }

    public static /* Test[] */ function GetSurveysCreatedByUser(\Auth\Users\User $user){
        return self::GetCreatedByUser($user, self::TYPE_SURVEY);
    }

    public static /* Test[] */ function GetCreatedByUser(\Auth\Users\User $user, int $type){
        $tests = [];
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_TESTS)
                ->Select()
                ->Where('author_id', '=', $user->GetId())
                ->AndWhere('type', '=', $type)
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

    public /* bool */ function Update(/* string? */ $name = null, /* float? */ $question_multiplier = null, /* int? */ $time_limit = null, /* string? */ $description = null){
        if(is_null($name)) $name = $this->GetName();
        if(is_null($question_multiplier)) $question_multiplier = $this->GetQuestionMultiplier();
        if(is_null($time_limit)) $time_limit = $this->GetTimeLimit();
        if(is_null($description)) $description = $this->GetDescription();

        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_TESTS)
                ->Update()
                ->Set('name', $name)
                ->Set('question_multiplier', $question_multiplier)
                ->Set('time_limit', $time_limit)
                ->Set('description', $description)
                ->Where('id', '=', $this->id)
                ->Run();
        
        return $result === true;
    }

    public static /* Test */ function Create(\Auth\Users\User $author, /* string */ $name = 'Test bez nazwy', /* int */ $time_limit = 0, /* float */ $question_multiplier = 1){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_TESTS)
                ->Insert()
                ->Value('name', $name)
                ->Value('author_id', $author->GetId())
                ->Value('creation_date', (new \DateTime())->format('Y-m-d H:i:s'))
                ->Value('time_limit', $time_limit)
                ->Value('question_multiplier', $question_multiplier)
                ->Value('type', self::TYPE_TEST)
                ->Run();
            
        if($result === false){
            Logger::Log('Nie udało się stworzyć testu: '.DatabaseManager::GetProvider()->GetError(), LogChannels::DATABASE);
            throw new \Exception('Nie udało się stworzyć testu.');
        }
        
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_TESTS)
                ->Select()
                ->OrderBy('id', 'DESC')
                ->Limit(1)
                ->Run();
        
        if($result === false || $result->num_rows == 0){
            Logger::Log('Nie udało się wczytać utworzonego właśnie testu: '.DatabaseManager::GetProvider()->GetError(), LogChannels::DATABASE);
            throw new \Exception('Nie udało się wczytać utworzonego właśnie testu.');
        }

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