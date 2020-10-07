import UserLoader from '../../entities/loaders/userloader';
import { GoToPage, HandleLinkClick } from '../../1page/page_manager';
import AuthManager from '../../auth/auth_manager';
import ChromeManager from '../../1page/chrome_manager';

/**
 * Klasa reprezentująca panel nawigacji
 */
export default class Navbar {
    protected NavbarRoot: HTMLElement | undefined;
    protected IsDrawn: boolean | undefined;

    /**
     * Tworzy klasę z odwołaniem do panelu nawigacji
     * @param navbar_id Identyfikator elementu, w którym znajdzie się panel nawigacji
     */
    public constructor(navbar_id: string) {
        let navbar_root = document.getElementById(navbar_id);
        if(navbar_root === null) throw 'Nie udało się utworzyć panelu nawigacji.';
        if(navbar_root.dataset.isNavbar == 'true') return;

        navbar_root.dataset.isNavbar = 'true';
        this.NavbarRoot = navbar_root;
    }

    /**
     * Wypełnia panel nawigacji linkami
     * 
     * Jeżeli użytkownik nie jest zalogowany, panel pozostaje pusty
     */
    public async Draw() {
        if(this.IsDrawn === true || this.NavbarRoot === undefined) return;
        this.NavbarRoot.style.display = '';

        ChromeManager.MobileHeader?.SetHamburgerButtonVisibility(true);

        let ul = document.createElement('ul');
        this.NavbarRoot.appendChild(ul);

        let li = document.createElement('li');
        ul.appendChild(li);
        li.classList.add('link', 'nav-toggle');
        li.addEventListener('click', this.ToggleVisibility.bind(this));
        li.innerHTML = '<a><i class="icon fa fa-fw fa-bars"></i></a>';

        ul.appendChild(this.CreateNavHeader());
        ul.appendChild(this.CreateNavLink('Strona główna', 'home', 'fa-home'));
        ul.appendChild(this.CreateNavLink('Testy', 'testy/lista', 'fa-pencil-square-o'));
        ul.appendChild(this.CreateNavLink('Biblioteka testów', 'testy/biblioteka', 'fa-files-o'));
        ul.appendChild(this.CreateNavLink('Ankiety', 'ankiety', 'fa-bar-chart'));
        ul.appendChild(this.CreateNavSeparator());
        ul.appendChild(this.CreateNavLink('Konto', 'konto', 'fa-user-o'));
        ul.appendChild(this.CreateNavLink('Wyloguj', async () => { await AuthManager.LogOut(); GoToPage('zaloguj/office'); }, 'fa-sign-out', ['vulnerable']));
        ul.appendChild(this.CreateNavSeparator());
        ul.appendChild(this.CreateNavLink('Pomoc', 'pomoc#spis_tresci', 'fa-question-circle'));

        let span_info = document.createElement('span');
        this.NavbarRoot.appendChild(span_info);
        span_info.classList.add('copyright');

        let a_info = document.createElement('a');
        span_info.appendChild(a_info);
        a_info.classList.add('event-navigation-link');
        a_info.href = 'informacje';
        a_info.textContent = 'Informacje o stronie';
        a_info.addEventListener('click', ((e: MouseEvent) => {
            HandleLinkClick(e, 'informacje');
            this.Hide();
        }).bind(this));

        this.AttachEventHandlers();
        this.IsDrawn = true;
    }

    /**
     * Niszczy panel nawigacji
     */
    public Destroy() {
        if(this.IsDrawn === false || this.NavbarRoot === undefined) return;
        this.Hide();
        this.NavbarRoot.textContent = '';
        this.NavbarRoot.style.display = 'none';

        ChromeManager.MobileHeader?.SetHamburgerButtonVisibility(false);
        this.IsDrawn = false;
    }

    /**
     * Tworzy nagłówek panelu nawigacji
     */
    protected CreateNavHeader() {
        let li = document.createElement('li');
        li.classList.add('header');
        li.textContent = 'Testina';
        (async () => {
            li.textContent = (await UserLoader.GetCurrent(true))?.GetFullName() ?? 'Niezalogowany';
        })();
        return li;
    }

    /**
     * Tworzy link, gotowy do umieszczenia w panelu nawigacji
     * @param caption Tekst linku
     * @param href Adres linku lub procedura obsługi zdarzenia kliknięcia
     * @param icon Ikona obok linku
     * @param css Klasy CSS linku
     */
    protected CreateNavLink(caption: string, href: string | (() => void), icon?: string, css?: string[]) {
        let li = document.createElement('li');
        li.classList.add('link');
        if(css !== undefined) li.classList.add(...css);

        let a = document.createElement('a');
        li.appendChild(a);
        if(typeof href == 'string') {
            a.href = href;
            a.addEventListener('click', ((e: MouseEvent) => {
                HandleLinkClick(e, href);
                this.Hide();
            }).bind(this));
        } else {
            a.href = 'javascript:void(0)';
            a.addEventListener('click', (e) => {
                href();

                e.preventDefault();
                return false;
            });
        }

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

    /**
     * Tworzy separator do umieszczenia w panelu nawigacji
     */
    protected CreateNavSeparator() {
        let li = document.createElement('li');
        li.classList.add('separator');
        return li;
    }

    /**
     * Przełącza widoczność panelu nawigacji
     */
    public ToggleVisibility() {
        this.NavbarRoot?.classList.toggle('shown');
    }

    /**
     * Ukrywa panel nawigacji
     */
    protected Hide() {
        this.NavbarRoot?.classList.remove('shown');
    }

    /**
     * Dołącza procedury obsługi zdarzeń do obiektów związanych z panelem nawigacji
     */
    protected AttachEventHandlers() {
        let navbar_backdrops = document.querySelectorAll('.nav-backdrop');
        for(let element of navbar_backdrops) {
            if((element as HTMLElement).dataset.hasClickHandler == 'true') continue;
            element.addEventListener('click', this.Hide.bind(this));
            (element as HTMLElement).dataset.hasClickHandler = 'true';
        }
    }
}