import MobileHeader from '../components/chrome/mobile_header';
import Navbar from '../components/chrome/navbar';
import PageParams from './page_params';

/**
 * Klasa zarządzająca elementami interfejsu przeglądarki
 */
export default class ChromeManager {
    /** Nagłówek mobilnej wersji strony */
    public static _MobileHeader: MobileHeader | undefined;
    /** Panel nawigacji */
    public static _ApplicationNavbar: Navbar | undefined;

    public static get MobileHeader() {
        return ChromeManager._MobileHeader;
    }
    public static set MobileHeader(value: MobileHeader | undefined) {
        if(ChromeManager._MobileHeader !== undefined) return;
        ChromeManager._MobileHeader = value;
    }

    public static get ApplicationNavbar() {
        return ChromeManager._ApplicationNavbar;
    }
    public static set ApplicationNavbar(value: Navbar | undefined) {
        if(ChromeManager._ApplicationNavbar !== undefined) return;
        ChromeManager._ApplicationNavbar = value;
    }

    /**
     * Ustawia adres wyświetlany na pasku adresu
     * @param new_url Nowy adres URL (względny)
     * @param page_id Adres strony skojarzony z adresem URL
     * @param params Parametr strony, do zapisania w historii przeglądarki
     * @param replace Czy zastąpić poprzedni wpis w historii przeglądarki
     */
    public static SetUrlAddress(new_url: string, page_id: string, params?: PageParams, replace: boolean = false) {
        let data = {
            page_id: page_id,
            params: params?.GetSimpleRepresentation()
        };

        if(replace) {
            history.replaceState(data, '', new_url);
        } else {
            history.pushState(data, '', new_url);
        }
    }

    /**
     * Ustawia tekst widoczny na pasku tytułu w przeglądarce
     * @param new_title Nowy tytuł
     */
    public static SetTitle(new_title: string) {
        if(new_title == '') {
            document.title = 'Testina';
            if(this.MobileHeader) this.MobileHeader.SetTitle(document.title);
        } else {
            document.title = new_title + ' – Testina';
            if(this.MobileHeader) this.MobileHeader.SetTitle(new_title);
        }
    }

    /**
     * Wykorzystuje ustawienie skórki zapisane w pamięci lokalnej do stylizacji strony
     */
    public static ApplySiteTheme() {
        try {
            let theme = localStorage.getItem('theme') ?? '0';

            document.documentElement.classList.remove('force-light', 'force-dark');
            switch(theme) {
                case '1':
                    document.documentElement.classList.add('force-light');
                    break;
                case '2':
                    document.documentElement.classList.add('force-dark');
                    break;
            }
        } catch(e) {

        }
    }
}