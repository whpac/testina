import CacheStore from './cache_store';

export default class CacheManager {
    protected static OpenCaches: Map<CacheStorages, CacheStore> | undefined;

    /**
     * Otwiera wskazany magazyn plików podręcznych, a jeśli jest już otwarty -
     * po prostu go zwraca
     * @param storage_name Nazwa magazynu
     */
    public static async Open(storage_name: CacheStorages) {
        if(this.OpenCaches === undefined) this.OpenCaches = new Map<CacheStorages, CacheStore>();

        if(!this.OpenCaches.has(storage_name)) {
            this.OpenCaches.set(storage_name, new CacheStore(await caches.open(storage_name)));
        }
        return this.OpenCaches.get(storage_name) as CacheStore;
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