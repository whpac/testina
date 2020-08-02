<?php
namespace Api\Formats;

use Api\Context;
use Api\Resources\Resource;

abstract class Formatter{
    private $Context;

    public abstract /* string */ function FormatResource($res, int $depth);
    public abstract /* string */ function GetContentType();

    public function SetContext(Context $context){
        $this->Context = $context;
    }

    protected function GetContext(){
        return $this->Context;
    }
}
?>