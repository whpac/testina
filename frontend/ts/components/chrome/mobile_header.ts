import Icon from '../basic/icon';

export default class MobileHeader {
    protected Header: HTMLHeadingElement;
    protected ButtonWrapper: HTMLElement;

    public constructor(element: HTMLElement) {
        let hamburger_btn = document.createElement('a');
        hamburger_btn.classList.add('nav-toggle', 'nav-icon');
        hamburger_btn.appendChild(new Icon('bars', 'fa-fw').GetElement());
        element.appendChild(hamburger_btn);

        this.Header = document.createElement('h1');
        this.Header.textContent = 'Testina';
        element.appendChild(this.Header);

        this.ButtonWrapper = document.createElement('div');
        this.ButtonWrapper.classList.add('mobile-header-buttons');
        element.appendChild(this.ButtonWrapper);
    }

    /**
     * Ustawia tytuł wyświetlany na nagłówku
     * @param title Nowy tytuł
     */
    public SetTitle(title: string) {
        this.Header.textContent = title;
    }

    /**
     * Dodaje przycisk do nagłówka
     * @param icon Ikona do wyświetlenia na przycisku
     * @param click_handler Procedura obsługi kliknięcia
     * @param title Podpis przycisku
     */
    public AddButton(icon: Icon, click_handler: (this: HTMLButtonElement, ev: MouseEvent) => any, title?: string) {
        let button = document.createElement('button');
        icon.GetElement().classList.add('fa-fw');
        button.appendChild(icon.GetElement());
        button.title = title ?? '';
        button.addEventListener('click', click_handler);
        this.ButtonWrapper.appendChild(button);
    }

    /**
     * Usuwa przyciski z nagłówka
     */
    public RemoveButtons() {
        this.ButtonWrapper.textContent = '';
    }
}