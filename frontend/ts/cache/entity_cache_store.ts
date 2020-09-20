import { StripQueryAndFragment } from '../utils/urlutils';
import CacheStore from './cache_store';

export default class EntityCacheStore implements CacheStore {
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
            return undefined;
        }

        let expire_date = cached.headers.get('X-Expires');
        if(expire_date === null) {
            console.warn('Zasób nie posiada daty ważności, dlatego nie zostanie użyty');
            this.Cache.delete(request);
            return undefined;
        }

        if(new Date(expire_date) < new Date()) {
            this.Cache.delete(request);
            return undefined;
        }

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
        return this.Cache.put(request, response);
    }

    public async InvalidateUrl(url: string, applies_to_children: boolean): Promise<void> {
        // Zasoby są unieważniane, bez względu, jakie parametry przekazano
        url = StripQueryAndFragment(url);

        let cache_keys = await this.Cache.keys();
        let awaiters = [];

        for(let key of cache_keys) {
            let cached_url = StripQueryAndFragment(key.url);
            if(cached_url == url) awaiters.push(this.Cache.delete(key));
            else if(cached_url.startsWith(url) && applies_to_children) awaiters.push(this.Cache.delete(key));
        }
        for(let awaiter of awaiters) {
            await awaiter;
        }
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