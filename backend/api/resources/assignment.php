<?php
namespace Api\Resources;

class Assignment extends Resource{

    protected function LazyLoad($assignment, $name){
        $current_user = \UEngine\Modules\Auth\AccessControl\AuthManager::GetCurrentUser();

        $this->AddSubResource('id', new ValueResource($assignment->GetId()));
        $this->AddSubResource('attempt_limit', new ValueResource($assignment->GetAttemptLimit()));
        $this->AddSubResource('time_limit', new ValueResource($assignment->GetTimeLimit()->format('Y-m-d H:i:s')));
        $this->AddSubResource('assignment_date', new ValueResource($assignment->GetAssignmentDate()->format('Y-m-d H:i:s')));
        $this->AddSubResource('attempt_count', new ValueResource($assignment->CountUserAttempts($current_user)));
        $this->AddSubResource('score', new ValueResource($assignment->GetAverageScore($current_user)));
        $this->AddSubResource('test', new Test($assignment->GetTest()));
        $this->AddSubResource('attempts', new AttemptCollection($assignment));
        
        //$this->AddSubResource('targets', new AnswerCollection($assignment));
        return true;
    }

    // public function Update(/* mixed */ $data, /* undefined yet */ $context){
    //     $question = $this->GetConstructorArgument();
    //     $res = $question->Update($data->text, $data->type, $data->points, $data->points_counting, $data->max_typos);

    //     if(!$res) throw new \Exception('Nie udało się zaktualizować pytania.');
    // }

    // public function Delete(/* undefined yet */ $context){
    //     $question = $this->GetConstructorArgument();
    //     $res = $question->Remove();

    //     if(!$res) throw new \Exception('Nie udało się usunąć pytania.');
    // }
}
?>