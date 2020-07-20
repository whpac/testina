<?php
namespace Api\Resources;

use Api\Exceptions;

class AttemptAnswers extends Resource {

    protected function LazyLoad($attempt, $name){
        // Kolekcja odpowiedzi dla podejścia jest na razie pusta
        return true;
    }

    public function CreateSubResource(/* object */ $source){
        $attempt = $this->GetConstructorArgument();

        // Sprawdź, czy użytkownik nie wysłał wcześniej odpowiedzi
        if($attempt->GetUserAnswers()->Count() > 0){
            throw new Exceptions\BadRequest('W każdym podejściu można wysłać tylko jeden zestaw odpowiedzi.');
        }

        /**
         * Sprawdź, czy rozwiązanie nie wpłynęło po czasie
         * Pierwszeństwo ma termin określony w przypisaniu
         * Użytkownik ma dodatkowy 60-sekundowy bufor na nadesłanie rozwiązań
         */
        $assignment = $attempt->GetAssignment();
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
            if($question->done){
                foreach($question->answers as $answer){
                    try{
                        \Entities\UserAnswer::Create($attempt, new \Entities\Answer($answer->id), $question_index);
                    }catch(Exception $e){
                        $errors++;
                    }
                }
            }else{
                \Entities\UserAnswer::CreateNoAnswer($attempt, $question_index, new \Entities\Question($question->id));
            }
        }

        if($errors > 0){
            $attempt->Remove();
            throw new \Exception('Wystąpił błąd podczas zapisywania odpowiedzi do bazy danych.');
        }

        // Count score
        $user_answers = $attempt->GetUserAnswers();
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
        $attempt->UpdateScore($score_got, $score_max);
    }
}
?>