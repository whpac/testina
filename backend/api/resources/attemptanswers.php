<?php
namespace Api\Resources;

use Api\Exceptions;
use Api\Validation\TypeValidator;

class AttemptAnswers extends Resource {
    protected $Attempt;

    public function __construct($attempt){
        parent::__construct();

        $this->Attempt = $attempt;
    }

    public function CreateSubResource(/* object */ $source){
        TypeValidator::AssertIsObject($source);
        TypeValidator::AssertIsArray($source->questions, 'questions');

        // Sprawdź, czy użytkownik nie wysłał wcześniej odpowiedzi
        if($this->Attempt->GetUserAnswers()->Count() > 0){
            throw new Exceptions\BadRequest('W każdym podejściu można wysłać tylko jeden zestaw odpowiedzi.');
        }

        /**
         * Sprawdź, czy rozwiązanie nie wpłynęło po czasie
         * Pierwszeństwo ma termin określony w przypisaniu
         * Użytkownik ma dodatkowy 60-sekundowy bufor na nadesłanie rozwiązań
         */
        $assignment = $this->Attempt->GetAssignment();
        if($assignment->GetTimeLimit() < (new \DateTime('-60 seconds'))){
            throw new Exceptions\BadRequest('Termin rozwiązania tego testu upłynął.');
        }

        $test = $assignment->GetTest();
        if($test->HasTimeLimit()){
            $time_limit = $test->GetTimeLimit();
            $interval = new \DateInterval('PT'.$time_limit.'S');
            $time_limit = $assignment->GetTimeLimit()->add($interval);

            if($time_limit < new \DateTime('-60 seconds')){
                throw new Exceptions\BadRequest('Termin rozwiązania tego testu upłynął.');
            }
        }

        $errors = 0;
        foreach($source->questions as $question_index => $question){
            TypeValidator::AssertIsBool($question->done, 'done');

            if($question->done){
                TypeValidator::AssertIsArray($question->answers, 'question.answers');
                TypeValidator::AssertIsInt($question->id, 'question.id');
                TypeValidator::AssertIsBool($question->is_open, 'question.is_open');

                foreach($question->answers as $answer){
                    try{
                        if(isset($answer->text)){
                            TypeValidator::AssertIsString($answer->text, 'answer.text');
                            
                            \Entities\UserAnswer::CreateOpenAnswer($this->Attempt, $question_index, new \Entities\Question($question->id), $answer->text);
                        }else{
                            TypeValidator::AssertIsInt($answer->id, 'answer.id');

                            if($answer->id >= 0){
                                \Entities\UserAnswer::Create($this->Attempt, new \Entities\Answer($answer->id), $question_index);
                            }else{
                                \Entities\UserAnswer::CreateSpecialAnswer($this->Attempt, $answer->id, $question_index, new \Entities\Question($question->id));
                            }
                        }
                    }catch(Exception $e){
                        $errors++;
                    }
                }
            }else{
                \Entities\UserAnswer::CreateNoAnswer($this->Attempt, $question_index, new \Entities\Question($question->id));
            }
        }

        if($errors > 0){
            $this->Attempt->Remove();
            throw new \Exception('Wystąpił błąd podczas zapisywania odpowiedzi do bazy danych.');
        }

        // Count score
        $user_answers = $this->Attempt->GetUserAnswers();
        $answered_questions = $user_answers->GetAnsweredQuestions();

        $score_got = 0;
        $score_max = 0;

        foreach($answered_questions as $question){
            $answer_sets = $user_answers->GetAnswersByQuestion($question);
            
            foreach($answer_sets as $answer_set){
                $score_got += $question->CountPoints($answer_set);
                $score_max += $question->GetPoints();
            }
        }

        // Update attempt to reflect the score
        $this->Attempt->UpdateScore($score_got, $score_max);
        $this->Attempt->MarkAsFinished();
    }
}
?>