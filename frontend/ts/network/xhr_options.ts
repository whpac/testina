import Deserializer from './deserializers/deserializer';

export default interface XHROptions {
    /** Metoda żądania */
    Method?: string;
    /** Obiekt, który przetworzy odpowiedź z serwera */
    ResponseDeserializer?: Deserializer;
    /** Dane przesyłane z żądaniem */
    RequestData?: any;
    /** Czy pominąć pamięć podręczną */
    SkipCache?: boolean;
}