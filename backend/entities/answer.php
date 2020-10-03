<?php
namespace Entities;

use Database\DatabaseManager;
use Log\Logger;
use Log\LogChannels;

define('TABLE_ANSWERS', 'answers');

class Answer extends EntityWithFlags {
    protected /* int */ $id;
    protected /* int */ $question_id;
    protected /* string */ $text;
    protected /* int */ $order;

    // Maski bitowe flag
    public const FLAG_CORRECT = 1;

    protected static /* string */ function GetTableName(){
        return TABLE_ANSWERS;
    }

    protected static /* bool */ function AllowsDeferredFetch(){
        return true;
    }

    protected function OnPopulate(): void{
        parent::OnPopulate();

        settype($this->id, 'int');
        settype($this->question_id, 'int');
        settype($this->order, 'int');
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

    public /* int */ function GetOrder(){
        $this->FetchIfNeeded();
        return $this->order;
    }

    public /* bool */ function IsCorrect(){
        return ($this->GetFlagValue(self::FLAG_CORRECT) == 1);
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

    public static /* Answer */ function Create(/* Question */ $question, /* string */ $text, array $flags = [], /* int */ $order = 0){
        $flags_int = self::ConvertFlagsToInt($flags);

        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_ANSWERS)
                ->Insert()
                ->Value('question_id', $question->GetId())
                ->Value('text', $text)
                ->Value('flags', $flags_int)
                ->Value('order', 0)
                ->Run();
        
        if($result === false){
            Logger::Log('Nie udało się utworzyć odpowiedzi: '.DatabaseManager::GetProvider()->GetError(), LogChannels::DATABASE);
            throw new \Exception('Nie udało się utworzyć odpowiedzi.');
        }

        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_ANSWERS)
                ->Select()
                ->OrderBy('id', 'DESC')
                ->Limit(1)
                ->Run();
        
        return new Answer($result->fetch_assoc());
    }

    public /* bool */ function Update(/* string? */ $text = null, array $flags = [], /* int? */ $order = null){
        if(is_null($text)) $text = $this->GetText();
        if(is_null($order)) $order = $this->GetOrder();
        
        $flags_int = $this->GetFlags();
        $flags_int = self::ConvertFlagsToInt($flags, $flags_int);

        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_ANSWERS)
                ->Update()
                ->Set('text', $text)
                ->Set('flags', $flags_int)
                ->Set('order', $order)
                ->Where('id', '=', $this->GetId())
                ->Run();
        
        return $result;
    }

    public /* bool */ function Remove(){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_ANSWERS)
                ->Delete()
                ->Where('id', '=', $this->GetId())
                ->Run();
        
        return $result;
    }
}
?>