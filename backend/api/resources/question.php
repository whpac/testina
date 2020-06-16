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
}
?>