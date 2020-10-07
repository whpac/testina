import ChromeManager from '../../1page/chrome_manager';
import Card from '../basic/card';
import Toast from '../basic/toast';

export default class SiteSettingsCard extends Card {
    protected ThemeSwitcher: HTMLSelectElement;

    public constructor() {
        super();

        let heading = document.createElement('h2');
        heading.textContent = 'Ustawienia strony';
        this.AppendChild(heading);

        let theme_description = document.createElement('p');
        theme_description.textContent = 'Tutaj możesz wybrać, czy chcesz aby Testina była wyświetlana w wersji jasnej czy ciemnej.';
        this.AppendChild(theme_description);

        this.ThemeSwitcher = document.createElement('select');
        this.AppendChild(this.ThemeSwitcher);

        let options = ['Zgodnie z motywem przeglądarki', 'Motyw jasny', 'Motyw ciemny'];
        for(let i = 0; i < options.length; i++) {
            let option_element = document.createElement('option');
            option_element.textContent = options[i];
            option_element.value = i.toString();
            this.ThemeSwitcher.appendChild(option_element);
        }

        this.ThemeSwitcher.value = localStorage.getItem('theme') ?? '0';
        this.ThemeSwitcher.addEventListener('change', this.ApplyThemeSetting.bind(this));


        let theme_details = document.createElement('p');
        theme_details.classList.add('secondary', 'small');
        theme_details.textContent = 'To ustawienie jest przechowywane w przeglądarce i może mieć inną wartość na różnych urządzeniach.';
        this.AppendChild(theme_details);
    }

    protected ApplyThemeSetting() {
        try {
            localStorage.setItem('theme', this.ThemeSwitcher.value);
            ChromeManager.ApplySiteTheme();
        } catch(e) {
            new Toast('Nie udało się zapisać ustawienia. Możliwe, że strona nie ma uprawnień do zapisu danych w pamięci lokalnej.').Show(0);
        }
    }
}