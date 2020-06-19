export default abstract class Page {

    abstract LoadInto(container: HTMLElement, params?: any): Promise<void>;
    abstract UnloadFrom(container: HTMLElement): void;

    abstract GetUrlPath(): string;
    abstract async GetTitle(): Promise<string>;
}