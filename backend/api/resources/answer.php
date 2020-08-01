<?php
namespace Api\Resources;

class Answer extends Resource{

    protected function LazyLoad($answer, $name){
        $this->AddSubResource('id', new ValueResource($answer->GetId()));
        $this->AddSubResource('text', new ValueResource($answer->GetText()));
        $this->AddSubResource('correct', new ValueResource($answer->IsCorrect()));

        return true;
    }

    public function Update(/* mixed */ $data){
        $answer = $this->GetConstructorArgument();
        $res = $answer->Update($data->text, ['correct' => $data->correct]);

        if(!$res) throw new \Exception('Nie udało się zaktualizować odpowiedzi');
    }

    public function Delete(){
        $answer = $this->GetConstructorArgument();
        $res = $answer->Remove();

        if(!$res) throw new \Exception('Nie udało się usunąć odpowiedzi');
    }
}
?>