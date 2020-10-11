<?php
namespace Api\Formats;

class Base64JsonFormatter extends JsonFormatter {

    public function Format($obj, int $depth = 3): string{
        return base64_encode($this->FormatResource($obj, $depth));
    }

    public function GetContentType(): string{
        return 'application/x.json+base64';
    }
}
?>