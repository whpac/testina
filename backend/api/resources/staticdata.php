<?php
namespace Api\Resources;

use Api\Schemas;

class StaticData extends Resource implements Schemas\StaticData{

    public function GetKeys(): array{
        return [
            'licenses'
        ];
    }

    public function licenses(): Schemas\Licenses{
        $licenses = new Licenses();
        $licenses->SetContext($this->GetContext());
        return $licenses;
    }
}
?>