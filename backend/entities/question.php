<?php
namespace Entities;

use Database\DatabaseManager;
use Log\Logger;
use Log\LogChannels;

define('TABLE_QUESTIONS', 'questions');

class Question extends EntityWithFlags {
    protected /* int */ $id;
    protected /* int */ $test_id;
    protected /* string */ $text;
    protected /* int8 */ $type;
    protected /* float */ $points;
    protected /* int8 */ $points_counting;
    protected /* int8 */ $max_typos;
    protected /* ?string */ $footer;
    protected /* int */ $order;

    const TYPE_SINGLE_CHOICE = 0;
    const TYPE_MULTI_CHOICE = 1;
    const TYPE_OPEN_ANSWER = 2;

    const COUNTING_LINEAR = 0;
    const COUNTING_BINARY = 1;
    const COUNTING_OPEN_ANSWER = 2;

    // Maski bitowe flag
    public const FLAG_OPTIONAL = 1;
    public const FLAG_NON_APPLICABLE = 2;
    public const FLAG_OTHER = 4;

    protected static /* string */ function GetTableName(){
        return TABLE_QUESTIONS;
    }

    protected static /* bool */ function AllowsDeferredFetch(){
        return true;
    }

    protected function OnPopulate(): void{
        parent::OnPopulate();

        settype($this->id, 'int');
        settype($this->test_id, 'int');
        settype($this->type, 'int');
        settype($this->points, 'float');
        settype($this->points_counting, 'int');
        settype($this->max_typos, 'int');
        settype($this->order, 'int');
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

    public /* int */ function GetMaxNumberOfTypos(){
        $this->FetchIfNeeded();
        return $this->max_typos;
    }

    public /* ?string */ function GetFooter(){
        $this->FetchIfNeeded();
        return $this->footer;
    }

    public /* int */ function GetOrder(){
        $this->FetchIfNeeded();
        return $this->order;
    }

    public /* bool */ function IsOptional(){
        return ($this->GetFlagValue(self::FLAG_OPTIONAL) == 1);
    }

    public /* bool */ function HasNonApplicableAnswer(){
        return ($this->GetFlagValue(self::FLAG_NON_APPLICABLE) == 1);
    }

    public /* bool */ function HasOtherAnswer(){
        return ($this->GetFlagValue(self::FLAG_OTHER) == 1);
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
                ->OrderBy('id', 'ASC')
                ->OrderBy('order', 'ASC')
                ->Run();
        
        for($i=0; $i<$result->num_rows; $i++){
            $row = $result->fetch_assoc();
            $questions[] = new Question($row);
        }

        return $questions;
    }

    public /* bool */ function Update(/* string? */ $text = null, /* int? */ $type = null, /* float? */ $points = null, /* int? */ $points_counting = null, /* int? */ $max_typos = null, /* ?string */ $footer = null, /* ?int */ $order = null, array $flags = []){
        if(is_null($text)) $text = $this->GetText();
        if(is_null($type)) $type = $this->GetType();
        if(is_null($points)) $points = $this->GetPoints();
        if(is_null($points_counting)) $points_counting = $this->GetPointsCounting();
        if(is_null($max_typos)) $max_typos = $this->GetMaxNumberOfTypos();
        if(is_null($footer)) $footer = $this->GetFooter();
        if(is_null($order)) $order = $this->GetOrder();

        $flags_int = $this->GetFlags();
        $flags_int = self::ConvertFlagsToInt($flags, $flags_int);

        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_QUESTIONS)
                ->Update()
                ->Set('text', $text)
                ->Set('type', $type)
                ->Set('points', $points)
                ->Set('points_counting', $points_counting)
                ->Set('max_typos', $max_typos)
                ->Set('footer', $footer)
                ->Set('order', $order)
                ->Set('flags', $flags_int)
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

    public static /* Question */ function Create(/* Test */ $test, /* string */ $text, /* int */ $type, /* float */ $points, /* int */ $points_counting, /* int */ $max_typos, /* string */ $footer = '', /* int */ $order = 0, array $flags = []){
        if(is_null($text)) throw new \Exception('Treść pytania nie może być null.');
        if(is_null($type)) throw new \Exception('Typ pytania nie może być null.');
        if(is_null($points)) throw new \Exception('Ilość punktów nie może być null.');
        if(is_null($points_counting)) throw new \Exception('Metoda liczenia punktów nie może być null.');
        if(is_null($max_typos)) throw new \Exception('Maksymalna ilość literówek nie może być null.');

        $flags_int = self::ConvertFlagsToInt($flags);

        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_QUESTIONS)
                ->Insert()
                ->Value('test_id', $test->GetId())
                ->Value('text', $text)
                ->Value('type', $type)
                ->Value('points', $points)
                ->Value('points_counting', $points_counting)
                ->Value('max_typos', $max_typos)
                ->Value('footer', $footer)
                ->Value('order', $order)
                ->Value('flags', $flags_int)
                ->Run();
        
        if($result === false){
            Logger::Log('Nie udało się dodać pytania: '.DatabaseManager::GetProvider()->GetError(), LogChannels::DATABASE);
            throw new \Exception('Nie udało się dodać pytania.');
        }

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
            case self::TYPE_OPEN_ANSWER:
                return $this->CountPointsOpenAnswer($user_answers);
            break;
        }
        return null;
    }

    public /* float */ function CountPointsMultiChoice(/* UserAnswer[] */ array $user_answers){
        $selected_ids = [];
        $correct_ids = [];

        foreach($user_answers as $user_answer){
            $answer = $user_answer->GetAnswer();
            if(!is_null($answer)) $selected_ids[] = $answer->GetId();
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
        $correct_answers = count($correct_ids);

        if($correct_answers != 0) $points *= 1 - ($wrong_answers / $correct_answers);
        else $points = 0;

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

    protected /* float */ function CountPointsOpenAnswer(/* UserAnswer[] */ array $user_answers){
        if(count($user_answers) == 0) return 0;
        if(!$user_answers[0]->IsOpenAnswer()) return 0;

        // W pytaniu otwartym użytkownik może zaznaczyć tylko jedną odpowiedź
        $answer = $user_answers[0]->GetSuppliedAnswer();

        $utf8_ascii_map = [];
        $ascii_answer = \Utils\StringUtils::Utf8ToExtendedAscii($answer, $utf8_ascii_map);

        $correct_answers = $this->GetAnswers();
        $max_typos = $this->GetMaxNumberOfTypos();

        // Przechodzi przez każdą z prawidłowych odpowiedzi
        foreach($correct_answers as $correct_answer){
            if(!$correct_answer->IsCorrect()) continue;

            // Jeżeli literówki są niedopuszczalne, użyj zwykłego porównania (dużo szybsze)
            if($max_typos <= 0){
                if($answer == $correct_answer->GetText()){
                    return $this->GetPoints();
                }
            }else{
                // Porównaj odległość Levenshteina z ograniczeniem literówek (powolne)
                // Ponieważ funkcja levenshtein() operuje na bajtach, należy przekodować tekst
                $answer_text = \Utils\StringUtils::Utf8ToExtendedAscii($correct_answer->GetText(), $utf8_ascii_map);
                if(levenshtein($ascii_answer, $answer_text) <= $max_typos){
                    return $this->GetPoints();
                }
            }
        }

        // Kiedy nie znaleziono pasującej odpowiedzi, zwróć wynik 0 punktów
        return 0;
    }
}
?>