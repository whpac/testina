<?php
namespace Layout;

use \UEngine\Modules\Pages\Renderers;
use \UEngine\Modules\Pages\PageManager;

class StandardRenderer extends Renderers\PlainRenderer{
    protected /* string */ $back_arrow_href = null;

    public /* void */ function Prepend(array $options){
        parent::Prepend($options);

        echo('<!DOCTYPE html>');
        echo('<html'.(isset($options['lang']) ? ' lang="'.$options['lang'].'"' : '').'>');
        echo('<head>');
        echo('<meta charset="utf-8" />');
        echo('<meta name="viewport" content="width=device-width, initial-scale=1" />');
        echo('<title>'.PageManager::GetFullTitle().'</title>');

        $head_tags = PageManager::GetHeadTags();
        foreach($head_tags as $tag)
            echo($tag);

        if(PageManager::IsFaviconSet())
            echo('<link rel="shortcut icon" href="'.PageManager::GetFavicon().'" />');

        $stylesheets = PageManager::GetStylesheets();
        $links = '';
        foreach($stylesheets as $sheet)
            $links .= '<link rel="stylesheet" href="'.$sheet.'" />';
        echo($links);

        $scripts = PageManager::GetScripts();
        $script_tags = '';
        foreach($scripts as $script)
            $script_tags .= '<script src="'.$script[0].'" '.($script[1] ? 'type="module"' : '').'></script>';
        echo($script_tags);

        echo('</head>');
        $get_path = '';
        if(isset($_GET['_path'])) $get_path = $_GET['_path'];
        echo('<body class="preload" data-url="'.$get_path.'">');
        
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
        echo('</body>');
        echo('</html>');
        if(isset($options['render_time'])) echo('<!-- Render time: '.$options['render_time'].' -->');
        parent::Append($options);
    }

    public /* void */ function AddBackArrow($href){
        $this->back_arrow_href = $href;
    }
}
?>