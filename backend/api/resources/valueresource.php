<?php
namespace Api\Resources;

class ValueResource extends Resource {

    public function __construct(/* mixed */ $value){
        $this->IsValueResource = true;
        $this->SetValue($value);
    }
}
?>