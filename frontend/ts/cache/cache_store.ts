export default class CacheStore {
    protected Cache: Cache;

    public constructor(cache: Cache) {
        this.Cache = cache;
    }

    /**
     * Zwraca zasób z pamięci podręcznej, pod warunkiem, że jego termin ważności nie upłynął
     * @param request Żądanie zwrócenia zasobu
     */
    public async GetResource(request: Request): Promise<Response | undefined> {
        let cached = await this.Cache.match(request);
        if(cached === undefined) {
            console.debug('Zasób nie istnieje w pamięci podręcznej');
            return undefined;
        }

        let expire_date = cached.headers.get('X-Expires');
        if(expire_date === null) {
            console.warn('Zasób nie posiada daty ważności, dlatego nie zostanie użyty');
            this.Cache.delete(request);
            return undefined;
        }

        if(new Date(expire_date) < new Date()) {
            console.debug('Zasób jest przeterminowany');
            this.Cache.delete(request);
            return undefined;
        }

        //console.debug('Wczytywanie zasobu ' + request.url);
        return cached;
    }

    /**
     * Zapisuje odpowiedź serwera w pamięci podręcznej
     * @param request Zapytanie, które wykonano
     * @param response Odpowiedź serwera
     */
    public async SaveResponse(request: Request, response: Response) {
        if(response.headers.get('X-Expires') === null) {
            console.warn('Zasób, który miał zostać zapisany w pamięci podręcznej nie posiada nagłówka X-Expires.');
            return undefined;
        }
        //console.debug('Zapisywanie zasobu ' + request.url);
        return this.Cache.put(request, response);
    }

    /**
     * Czyści magazyn plików podręcznych
     */
    public async Purge() {
        let keys = await this.Cache.keys();
        let awaiters = [];
        for(let key of keys) {
            awaiters.push(this.Cache.delete(key));
        }
        for(let awaiter of awaiters) {
            await awaiter;
        }
    }
}