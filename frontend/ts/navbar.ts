import UserLoader from './entities/loaders/userloader';
import { HandleLinkClick } from './1page/pagemanager';

export function ToggleVisibility() {
    document.getElementById('main-nav')?.classList.toggle('shown');
}

export function Hide() {
    document.getElementById('main-nav')?.classList.remove('shown');
}

export function AttachEventHandlers() {
    let navbar_toggles = document.querySelectorAll('.nav-toggle');
    for(let element of navbar_toggles) {
        element.addEventListener('click', ToggleVisibility);
    }

    let navbar_backdrops = document.querySelectorAll('.nav-backdrop');
    for(let element of navbar_backdrops) {
        element.addEventListener('click', Hide);
    }
}

export async function Draw() {
    let navbar_root = document.getElementById('main-nav');
    if(navbar_root === null) throw 'Nie udało się utworzyć panelu nawigacji.';

    let ul = document.createElement('ul');
    navbar_root.appendChild(ul);

    let li = document.createElement('li');
    ul.appendChild(li);
    li.classList.add('link', 'nav-toggle');
    li.innerHTML = '<a><i class="icon fa fa-fw fa-bars"></i></a>';

    ul.appendChild(CreateNavHeader((await UserLoader.GetCurrent())?.GetFullName() ?? 'Niezalogowany'));
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
    a_info.textContent = 'Informacje o stronie';
    a_info.addEventListener('click', (e) => {
        HandleLinkClick(e, 'informacje');
        Hide();
    });
}

function CreateNavLink(caption: string, href: string, icon?: string, css?: string[]) {
    let li = document.createElement('li');
    li.classList.add('link');
    if(css !== undefined) li.classList.add(...css);

    let a = document.createElement('a');
    li.appendChild(a);
    a.href = href;
    a.addEventListener('click', (e) => {
        HandleLinkClick(e, href);
        Hide();
    });

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

function CreateNavSeparator() {
    let li = document.createElement('li');
    li.classList.add('separator');
    return li;
}

function CreateNavHeader(caption: string) {
    let li = document.createElement('li');
    li.classList.add('header');
    li.textContent = caption;
    return li;
}