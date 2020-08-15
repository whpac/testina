/**
 * Podstawowa klasa dla błędów
 */
export default class BaseException {
    public readonly Message: string;

    public constructor(message: string) {
        this.Message = message;
    }

    public toString() {
        return 'Błąd: ' + this.Message;
    }
}