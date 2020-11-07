<?php
namespace Api\Formats;

use \Api\Resources\Resource;

class ImageFormatter extends Formatter {

    public function Format($obj, int $depth = 3): string{
        if(!is_string($obj)) return '';
        return $obj;
    }

    public function GetContentType(): string{
        return 'image/*';
    }
}
?>