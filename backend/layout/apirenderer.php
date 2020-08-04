<?php
namespace Layout;

use \UEngine\Modules\Pages\Renderers;

class ApiRenderer extends Renderers\PlainRenderer{
    protected /* string */ $mime;

    public function __construct($extension = 'json'){
        $mime = \UEngine\Libs\UEFunctions\GetMimeTypeByExtension($extension);
        $this->mime = $mime;
    }

    public /* void */ function Prepend(array $options){
        header('Cache-Control: max-age=30');
        header('Content-Type: '.$this->mime);
    }

    /**
     * Used in API scripts to throw an error in consistent format
     */
    public static /* void */ function ThrowError($message, array $data = []){
        $json = [];
        $json['is_success'] = false;
        $json['message'] = $message;
        if(count($data) > 0) $json['data'] = $data;
        echo(json_encode($json));
    }
}
?>