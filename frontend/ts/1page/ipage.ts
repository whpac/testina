export default interface IPage {
    /** Sprawdza, czy strona jest dostępna */
    IsAccessible(): Promise<boolean>;

    /** Ładuje stronę do wskazanego elementu */
    LoadInto(container: HTMLElement, params?: any): Promise<void>;
    /** Usuwa stronę ze wskazanego elementu */
    UnloadFrom(container: HTMLElement): void;

    /** Zwraca ścieżkę do wyświetlenia na pasku adresu */
    GetUrlPath(): string | null;
    /** Zwraca tytuł strony do wyświetlenia w przeglądarce */
    GetTitle(): string;
}