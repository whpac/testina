/** Klasa reprezentująca wskaźnik ładowania */
export default class LoadingIndicator {
    /** Element HTML będący wskaźnikiem ładowania */
    LoadingWrapperElement: HTMLElement;

    /**
     * Klasa reprezentująca wskaźnik ładowania
     * @param wrapper_id Identyfikator elementu HTML, użytego jako wskaźnik ładowania
     */
    constructor(wrapper_id: string) {
        let wrapper = document.getElementById(wrapper_id);
        if(wrapper == null) throw 'Element with id ' + wrapper_id + ' doesn\'t exist.';

        this.LoadingWrapperElement = wrapper;
    }

    /** Pokazuje wskaźnik ładowania */
    Display() {
        this.LoadingWrapperElement.style.display = '';
    }

    /** Ukrywa wskaźnik ładowania */
    Hide() {
        this.LoadingWrapperElement.style.display = 'none';
    }

    /** Sprawdza, czy wskaźnik ładowania jest widoczny */
    IsVisible() {
        return this.LoadingWrapperElement.style.display != 'none';
    }
}