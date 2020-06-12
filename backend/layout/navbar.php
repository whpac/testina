<?php
namespace Layout;

use \UEngine\Modules\Pages\Navbar\NavbarStorage;
use \UEngine\Modules\Pages\Navbar\NavbarHeader;
use \UEngine\Modules\Pages\Navbar\NavbarItem;
use \UEngine\Modules\Pages\Navbar\NavbarSeparator;

class Navbar{

    public static /* void */ function PrintCode(){
        $navbar_items = NavbarStorage::GetItems();

        echo('<ul>');
        echo('<li class="link nav-toggle"><a><i class="icon fa fa-fw fa-bars"></i></a></li>');

        foreach($navbar_items as $item){
            self::PrintItem($item);
        }

        echo('</ul>');
        echo('<span class="copyright" role="menuitem"><a href="informacje">Informacje o stronie</a></span>');
    }

    protected static /* void */ function PrintItem(NavbarItem $item){
        if($item instanceof NavbarHeader){
            echo('<li class="header" role="heading">');
            echo($item->GetContent());
        }elseif($item instanceof NavbarSeparator){
            echo('<li class="separator" role="separator">');
        }else{
            echo('<li class="link '.$item->css.'" role="menuitem">');
            echo('<a href="'.$item->href.'">');
            if(isset($item->icon)) echo('<i class="icon fa fa-fw '.$item->icon.'"  title="'.$item->GetContent().'"></i>');
            else echo('<i class="icon fa fa-fw"></i>');
            echo('<span>'.$item->GetContent().'</span>');
            echo('</a>');
        }
        echo('</li>');
    }
}
?>