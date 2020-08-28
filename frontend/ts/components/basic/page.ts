import Component from './component';
import AuthManager from '../../auth/auth_manager';
import IPage from '../../1page/ipage';

/**
 * Klasa bazowa dla wszystkich stron
 */
export default abstract class Page extends Component implements IPage {

    constructor() {
        super();

        this.Element.classList.add('page');
    }

    /** Sprawdza, czy bieżący użytkownik może wyświetlić tę stronę */
    public async IsAccessible() {
        return await AuthManager.IsAuthorized();
    }

    /** Ładuje stronę do wskazanego elementu */
    abstract LoadInto(container: HTMLElement, params?: any): Promise<void>;
    /** Usuwa stronę ze wskazanego elementu */
    abstract UnloadFrom(container: HTMLElement): void;

    /** Zwraca ścieżkę do wyświetlenia na pasku adresu */
    abstract GetUrlPath(): string | null;
    /** Zwraca tytuł strony do wyświetlenia w przeglądarce */
    abstract async GetTitle(): Promise<string>;
}