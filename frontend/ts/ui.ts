export function ToggleNavigationVisibility(){
    document.getElementById('main-nav')?.classList.toggle('shown');
}

export function HideNavigation(){
    document.getElementById('main-nav')?.classList.remove('shown');
}
