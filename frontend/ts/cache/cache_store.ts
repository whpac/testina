export default interface CacheStore {

    /**
     * Zwraca zasób z pamięci podręcznej, jeśli istnieje
     * @param request Żądanie zwrócenia zasobu
     */
    GetResource(request: Request): Promise<Response | undefined>;

    /**
     * Zapisuje odpowiedź serwera w pamięci podręcznej
     * @param request Zapytanie, które wykonano
     * @param response Odpowiedź serwera
     */
    SaveResponse(request: Request, response: Response): Promise<void>;

    /**
     * Czyści magazyn plików podręcznych
     */
    Purge(): Promise<void>;
}