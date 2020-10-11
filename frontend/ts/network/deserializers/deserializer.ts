export default interface Deserializer {

    /** Zwraca typy MIME, które deserializer może obsłużyć (w formie q-listy do nagłówka Accept) */
    GetAcceptableMimeTypes(): string;

    /** Przetwarza odpowiedź */
    Parse(source: string): any;
}