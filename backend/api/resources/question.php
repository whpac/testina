<?php
namespace Api\Resources;

class Question extends Resource{

    protected function LazyLoad($question, $name){
        $this->AddSubResource('id', new ValueResource($question->GetId()));
        $this->AddSubResource('text', new ValueResource($question->GetText()));
        $this->AddSubResource('type', new ValueResource($question->GetType()));
        $this->AddSubResource('points', new ValueResource($question->GetPoints()));
        $this->AddSubResource('points_counting', new ValueResource($question->GetPointsCounting()));
        $this->AddSubResource('max_typos', new ValueResource($question->GetMaxNumberOfTypos()));
        
        $this->AddSubResource('answers', new AnswerCollection($question));
        return true;
    }

    public function Update(/* mixed */ $data, /* undefined yet */ $context){
        $question = $this->GetConstructorArgument();
        $res = $question->Update($data->text, $data->type, $data->points, $data->points_counting, $data->max_typos);

        if(!$res) throw new \Exception('Nie udało się zaktualizować pytania.');
    }
}
?>