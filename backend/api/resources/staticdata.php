<?php
namespace Api\Resources;

use Api\Schemas;

class StaticData extends Resource implements Schemas\StaticData{

    public function GetKeys(): array{
        return [
            'licenses',
            'question_images'
        ];
    }

    public function licenses(): Schemas\Licenses{
        $licenses = new Licenses();
        $licenses->SetContext($this->GetContext());
        return $licenses;
    }

    public function question_images(): Schemas\Collection{
        $question_images = new QuestionImages();
        $question_images->SetContext($this->GetContext());
        return $question_images;
    }
}
?>