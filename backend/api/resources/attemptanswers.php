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