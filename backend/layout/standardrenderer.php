<?php
namespace Layout;

use \UEngine\Modules\Pages\Renderers;
use \UEngine\Modules\Pages\PageManager;

class StandardRenderer extends Renderers\HTMLRenderer{
    protected /* string */ $back_arrow_href = null;

    public /* void */ function Prepend(array $options){
        parent::Prepend($options);
        
        $title = PageManager::GetTitle();
        if(empty($title)) $title = PageManager::GetFullTitle();

        echo('<nav class="main-nav" id="main-nav">');
        Navbar::PrintCode();
        echo('</nav>');
        echo('<div class="nav-backdrop"></div>');
        echo('<aside class="mobile-header">');
        
        if(!is_null($this->back_arrow_href))
            echo('<a class="nav-icon" href="'.$this->back_arrow_href.'"><i class="icon fa fa-fw fa-arrow-left"></i></a>');
        else
            echo('<a class="nav-toggle nav-icon"><i class="icon fa fa-fw fa-bars"></i></a>');
        
        echo('<h1 id="mobile-header-title">'.$title.'</h1>');
        echo('</aside>');
        echo('<main id="content-container">');
    }

    public /* void */ function Append(array $options){
        echo('</main>');
        echo('<aside id="loading-wrapper" class="loading-wrapper">Loading</aside>');
        parent::Append($options);
    }

    public /* void */ function AddBackArrow($href){
        $this->back_arrow_href = $href;
    }
}
?>