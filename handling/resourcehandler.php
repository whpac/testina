<?php
namespace Handling;

use \UEngine\Modules\Pages\PageManager;
use \UEngine\Modules\Pages\Handlers;
use \UEngine\Modules\Pages\Renderers;

class ResourceHandler extends Handlers\ResourceHandler{

    public /* string */ function GetPageByUrl($url){
        $res = parent::GetPageByUrl($url);

        if(!is_null($res)){
            // This is done to ensure that there will be no additional HTML tags on resources
            // The file name is given in order to send appropriate MIME type
            PageManager::SetRenderer(new Renderers\ResourceRenderer(['file' => $res]));
        }

        return $res;
    }
}
?>