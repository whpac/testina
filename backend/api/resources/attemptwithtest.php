<?php
namespace Api\Resources;

class AttemptWithTest extends Resource {

    protected function LazyLoad($data, $name){
        $assignment = $data[0];
        $current_user = $data[1];

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
        $this->AddSubResource('questions', new QuestionCollection($questions));
        $this->AddSubResource('max_score', new ValueResource($max_score));
        $this->AddSubResource('path', new ValueResource($path));

        return true;
    }
}
?>