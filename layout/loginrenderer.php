<?php
namespace Layout;

use \UEngine\Modules\Pages\Renderers;

class LoginRenderer extends Renderers\HTMLRenderer{

    public /* void */ function Prepend(array $options){
        parent::Prepend($options);
        echo('<main class="login">');
    }

    public /* void */ function Append(array $options){
        echo('</main>');
        parent::Append($options);
    }
}
?>