import ChromeManager from '../../1page/chrome_manager';
import Icon from '../basic/icon';

export default class MobileHeader {
    protected HamburgerButton: HTMLElement;
    protected Header: HTMLHeadingElement;
    protected ButtonWrapper: HTMLElement;

    public constructor(element: HTMLElement) {
        this.HamburgerButton = document.createElement('a');
        this.HamburgerButton.classList.add('nav-toggle', 'nav-icon');
        this.HamburgerButton.appendChild(new Icon('bars', 'fa-fw').GetElement());
        this.HamburgerButton.addEventListener('click', () => ChromeManager.ApplicationNavbar.ToggleVisibility());
        element.appendChild(this.HamburgerButton);

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

    /**
     * Ustawia widoczność przycisku menu
     * @param is_visible Czy przycisk jest widoczny
     */
    public SetHamburgerButtonVisibility(is_visible: boolean) {
        this.HamburgerButton.style.display = is_visible ? '' : 'none';
    }
}