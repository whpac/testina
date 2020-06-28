<?php
namespace Api\Resources;

class Attempt extends Resource {

    protected function LazyLoad($attempt, $name){
        $this->AddSubResource('id', new ValueResource($attempt->GetId()));
        $this->AddSubResource('user', new User($attempt->GetUser()));
        $this->AddSubResource('score', new ValueResource($attempt->GetScore()));
        $this->AddSubResource('max_score', new ValueResource($attempt->GetMaxScore()));
        $this->AddSubResource('begin_time', new ValueResource($attempt->GetBeginTime()->format('Y-m-d H:i:s')));

        return true;
    }
}
?>