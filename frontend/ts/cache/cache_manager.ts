import EntityCacheStore from './entity_cache_store';
import MockCacheStore from './mock_cache_store';
import CacheStore from './cache_store';

export default class CacheManager {
    protected static OpenCaches: Map<CacheStorages, EntityCacheStore> | undefined;

    /**
     * Otwiera wskazany magazyn plików podręcznych, a jeśli jest już otwarty -
     * po prostu go zwraca
     * @param storage_name Nazwa magazynu
     */
    public static async Open(storage_name: CacheStorages): Promise<CacheStore> {
        if(window.caches === undefined || window.caches === null) {
            return new MockCacheStore();
        }

        try {
            if(this.OpenCaches === undefined) this.OpenCaches = new Map<CacheStorages, EntityCacheStore>();

            if(!this.OpenCaches.has(storage_name)) {
                this.OpenCaches.set(storage_name, new EntityCacheStore(await caches.open(storage_name)));
            }
            return this.OpenCaches.get(storage_name) as EntityCacheStore;
        } catch(e) {
            if(!(e instanceof DOMException)) throw e;
            return new MockCacheStore();
        }
    }
}

export enum CacheStorages {
    /**
     * Magazyn przeznaczony na żądania do API. Każde z nich musi mieć ustawiony
     * nagłówek X-Expires, decydujący o terminie ważności. Ponadto, magazyn
     * może być czyszczony po za- lub wylogowaniu
     */
    Entities = 'data/entities'
}