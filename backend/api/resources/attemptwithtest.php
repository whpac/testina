<?php
namespace Api\Resources;

use Api\Exceptions;

class AttemptWithTest extends Resource {

    protected function LazyLoad($assignment, $name){
        $current_user = $this->GetContext()->GetUser();

        if(!$assignment->AreRemainingAttempts($current_user)){
            throw new Exceptions\BadRequest('Wykorzystał'.($current_user->IsFemale() ? 'a' : 'e').'ś już wszystkie podejścia.');
        }

        if($assignment->HasTimeLimitExceeded()){
            throw new Exceptions\BadRequest('Termin rozwiązania tego testu upłynął.');
        }

        $test = $assignment->GetTest();
        $questions = $test->GetQuestions();
        $q_count = $test->GetQuestionCount(); // Multiplier is taken into account

        $path = [];
        $points = [];
        while(count($path) < $q_count){
            foreach($questions as $question){
                $path[] = $question->GetId();
                $points[$question->GetId()] = $question->GetPoints();
            }
        }
        shuffle($path);
        $path = array_slice($path, 0, $q_count); // Drop the excess questions

        $max_score = 0;
        foreach($path as $q_id){
            $max_score += $points[$q_id];
        }

        $attempt = \Entities\Attempt::Create($current_user, $assignment, null, 0, $max_score);

        $this->AddSubResource('id', new ValueResource($attempt->GetId()));
        $this->AddSubResource('user', new User($attempt->GetUser()));
        $this->AddSubResource('max_score', new ValueResource($max_score));
        $this->AddSubResource('begin_time', new ValueResource($attempt->GetBeginTime()->format('Y-m-d H:i:s')));
        $this->AddSubResource('questions', new QuestionCollection($questions));
        $this->AddSubResource('path', new ValueResource($path));

        return true;
    }
}
?>