import Component from './component';

/**
 * Klasa bazowa dla wszystkich stron
 */
export default abstract class Page extends Component {

    abstract LoadInto(container: HTMLElement, params?: any): Promise<void>;
    abstract UnloadFrom(container: HTMLElement): void;

    abstract GetUrlPath(): string;
    abstract async GetTitle(): Promise<string>;
}