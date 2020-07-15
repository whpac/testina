<?php
namespace Api\Resources;

class Test extends Resource{

    protected function LazyLoad($test, $name){
        $this->AddSubResource('id', new ValueResource($test->GetId()));
        $this->AddSubResource('name', new ValueResource($test->GetName()));
        $this->AddSubResource('author', new User($test->GetAuthor()));
        $this->AddSubResource('creation_date', new ValueResource($test->GetCreationDate()->format('Y-m-d H:i:s')));
        $this->AddSubResource('time_limit', new ValueResource($test->GetTimeLimit()));
        $this->AddSubResource('question_multiplier', new ValueResource($test->GetQuestionMultiplier()));
        $this->AddSubResource('question_count', new ValueResource(count($test->GetQuestions())));
        
        $this->AddSubResource('questions', new QuestionCollection($test));
        return true;
    }

    public function Update(/* mixed */ $data){
        $test = $this->GetConstructorArgument();
        $res = $test->Update($data->name, $data->question_multiplier, $data->time_limit);

        if(!$res) throw new \Exception('Nie udało się zaktualizować testu.');
    }

    public function Delete(){
        $test = $this->GetConstructorArgument();
        $test->Remove();
    }
}
?>