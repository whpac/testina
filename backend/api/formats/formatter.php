<?php
namespace Api\Formats;

use Api\Resources\Resource;

abstract class Formatter{
    private $Context;

    public abstract function FormatObject(Resource $res, $depth);

    public function SetContext(/* undefined yet */ $context){
        $this->Context = $context;
    }

    protected function GetContext(){
        return $this->Context;
    }
}
?>