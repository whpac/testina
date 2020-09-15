import Icon from '../basic/icon';

export default class MobileHeader {
    protected Header: HTMLHeadingElement;

    public constructor(element: HTMLElement) {
        let hamburger_btn = document.createElement('a');
        hamburger_btn.classList.add('nav-toggle', 'nav-icon');
        hamburger_btn.appendChild(new Icon('bars', 'fa-fw').GetElement());
        element.appendChild(hamburger_btn);

        this.Header = document.createElement('h1');
        this.Header.textContent = 'Testina';
        element.appendChild(this.Header);
    }

    public SetTitle(title: string) {
        this.Header.textContent = title;
    }
}