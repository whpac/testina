<?php
namespace Api\Resources;

class Answer extends Resource{

    protected function LazyLoad($answer, $name){
        $this->AddSubResource('id', new ValueResource($answer->GetId()));
        $this->AddSubResource('text', new ValueResource($answer->GetText()));
        $this->AddSubResource('correct', new ValueResource($answer->IsCorrect()));

        return true;
    }
}
?>