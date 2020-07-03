import Component from './component';

/**
 * Klasa bazowa dla wszystkich stron
 */
export default abstract class Page extends Component {

    /** Ładuje stronę do wskazanego elementu */
    abstract LoadInto(container: HTMLElement, params?: any): Promise<void>;
    /** Usuwa stronę ze wskazanego elementu */
    abstract UnloadFrom(container: HTMLElement): void;

    /** Zwraca ścieżkę do wyświetlenia na pasku adresu */
    abstract GetUrlPath(): string;
    /** Zwraca tytuł strony do wyświetlenia w przeglądarce */
    abstract async GetTitle(): Promise<string>;
}