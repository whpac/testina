<?php
namespace Entities;

use Database\DatabaseManager;
use Log\Logger;
use Log\LogChannels;

define('TABLE_ANSWERS', 'answers');

class Answer extends Entity {
    protected /* int */ $id;
    protected /* int */ $question_id;
    protected /* string */ $text;
    protected /* int */ $flags;       // flags & 1 = correct
    protected static /* array */ $flag_map = ['correct' => 1];
    protected /* int */ $order;

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

    protected /* int */ function GetFlags(){
        $this->FetchIfNeeded();
        return $this->flags;
    }

    public /* int */ function GetOrder(){
        $this->FetchIfNeeded();
        return $this->order;
    }

    public /* int */ function GetFlagValue($flag_name){
        if(!isset(self::$flag_map[$flag_name])) return null;

        $bitmask = self::$flag_map[$flag_name];
        $flags_int = $this->GetFlags();

        while(($bitmask & 1) == 0){
            $bitmask = $bitmask >> 1;
            $flags_int = $flags_int >> 1;
        }

        return $flags_int & $bitmask;
    }

    public /* bool */ function IsCorrect(){
        return ($this->GetFlagValue('correct') == 1);
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

    protected static /* int */ function ConvertFlagsToInt(array $flags, /* int */ $orig_flags = 0){
        $flags_int = $orig_flags;
        foreach($flags as $flag_name => $flag_value){
            if(!isset(self::$flag_map[$flag_name])) continue;

            // Grab the bitmask for specified flag
            $flag_bitmask = self::$flag_map[$flag_name];

            // Clear previous flag value
            $flags_int = $flags_int & ~$flag_bitmask;

            // Calculate position of lowest flag bit
            $bits_to_shift_val = 0;
            $bitmask = $flag_bitmask;
            while(($bitmask & 1) == 0){
                $bitmask = $bitmask >> 1;
                $bits_to_shift_val++;
            }

            // Convert bool to number
            if(is_bool($flag_value)) $flag_value = $flag_value ? 1 : 0;
            
            // Align flag value with flag position
            $flag_value = $flag_value << $bits_to_shift_val;

            // Drop excess bits
            $flag_value = $flag_value & $flag_bitmask;

            // Put the flag value among others
            $flags_int = $flags_int | $flag_value;
        }
        return $flags_int;
    }
}
?>