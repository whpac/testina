/** Klasa reprezentująca ekran ładowania */
export default class SplashScreen {
    /** Element HTML będący ekranem ładowania */
    SplashWrapperElement: HTMLElement;

    /**
     * Klasa reprezentująca wskaźnik ładowania
     * @param wrapper_id Identyfikator elementu HTML, użytego jako wskaźnik ładowania
     */
    constructor(wrapper_id: string) {
        let wrapper = document.getElementById(wrapper_id);
        if(wrapper == null) throw 'Element o identyfikatorze ' + wrapper_id + ' nie istnieje.';

        this.SplashWrapperElement = wrapper;
    }

    /** Ukrywa ekran ładowania */
    Hide() {
        this.SplashWrapperElement.style.display = 'none';
    }

    /** Sprawdza, czy wskaźnik ładowania jest widoczny */
    IsVisible() {
        return this.SplashWrapperElement.style.display != 'none';
    }
}