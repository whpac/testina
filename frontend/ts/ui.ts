import UserLoader from './entities/loaders/userloader';

export function ToggleNavigationVisibility(){
    document.getElementById('main-nav')?.classList.toggle('shown');
}

export function HideNavigation(){
    document.getElementById('main-nav')?.classList.remove('shown');
}

export async function DrawNavbar(){
    let navbar_root = document.getElementById('main-nav');
    if(navbar_root === null) throw 'Nie udało się utworzyć panelu nawigacji.';

    let ul = document.createElement('ul');
    navbar_root.appendChild(ul);

    let li = document.createElement('li');
    ul.appendChild(li);
    li.classList.add('link', 'nav-toggle');
    li.innerHTML = '<a><i class="icon fa fa-fw fa-bars"></i></a>';

    ul.appendChild(CreateNavHeader((await UserLoader.GetCurrent()).GetFullName()));
    ul.appendChild(CreateNavLink('Strona główna', 'home', 'fa-home'));
    ul.appendChild(CreateNavLink('Testy', 'testy/lista', 'fa-pencil-square-o'));
    ul.appendChild(CreateNavLink('Biblioteka testów', 'testy/biblioteka', 'fa-files-o'));
    ul.appendChild(CreateNavLink('Ankiety', 'ankiety', 'fa-bar-chart'));
    ul.appendChild(CreateNavSeparator());
    ul.appendChild(CreateNavLink('Konto', 'konto', 'fa-user-o'));
    ul.appendChild(CreateNavLink('Wyloguj', '?wyloguj', 'fa-sign-out', ['vulnerable']));
    ul.appendChild(CreateNavSeparator());
    ul.appendChild(CreateNavLink('Pomoc', 'pomoc', 'fa-question-circle'));

    let span_info = document.createElement('span');
    navbar_root.appendChild(span_info);
    span_info.classList.add('copyright');

    let a_info = document.createElement('a');
    span_info.appendChild(a_info);
    a_info.classList.add('event-navigation-link');
    a_info.href = 'informacje';
    a_info.dataset.href = 'informacje';
    a_info.textContent = 'Informacje o stronie';
}

function CreateNavLink(caption: string, href: string, icon?: string, css?: string[]){
    let li = document.createElement('li');
    li.classList.add('link');
    if(css !== undefined) li.classList.add(...css);

    let a = document.createElement('a');
    li.appendChild(a);
    a.classList.add('event-navigation-link');
    a.href = href;
    a.dataset.href = href;

    let i = document.createElement('i');
    a.appendChild(i);
    i.classList.add('icon', 'fa', 'fa-fw');
    if(icon !== undefined) i.classList.add(icon);
    i.title = caption;

    let span = document.createElement('span');
    a.appendChild(span);
    span.textContent = caption;

    return li;
}

function CreateNavSeparator(){
    let li = document.createElement('li');
    li.classList.add('separator');
    return li;
}

function CreateNavHeader(caption: string){
    let li = document.createElement('li');
    li.classList.add('header');
    li.textContent = caption;
    return li;
}