import MobileHeader from '../components/chrome/mobile_header';
import PageParams from './page_params';

/**
 * Klasa zarządzająca elementami interfejsu przeglądarki
 */
export default class ChromeManager {
    /** Element stanowiący nagłówek mobilnej wersji strony */
    public static MobileHeader: MobileHeader;

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
}