import IPage from './ipage';
import PageRequest from './page_request';

type PageFactory = () => IPage;
type PageKey = string | RegExp;
type PageDescriptor = {
    CreatePage: PageFactory;
    Page?: IPage;
};

/**
 * Klasa służąca do przechowywania stron
 */
export default class PageStorage {
    /** Przechowuje instancję PageStorage */
    protected static _PageStorage: PageStorage | undefined;

    /** Przechowuje dane o niezainicjalizowanych jeszcze stronach */
    protected Pages: Map<PageKey, PageDescriptor>;

    public static GetStorage() {
        if(this._PageStorage === undefined) {
            this._PageStorage = new PageStorage();
        }
        return this._PageStorage;
    }

    public constructor() {
        this.Pages = new Map<PageKey, PageDescriptor>();
    }

    public RegisterPage(page_id: PageKey, descriptor: PageDescriptor) {
        this.Pages.set(page_id, descriptor);
    }

    /**
     * Funkcja zwraca stronę na podstawie żądania, dopasowując wskazany adres
     * do identyfikatorów stron i wyrażeń regularnych
     * 
     * @param request Żądanie
     */
    public GetPage(request: PageRequest) {
        let url = request.PageId;

        // Usuń ukośniki z końca adresu
        while(url.endsWith('/')) url = url.substr(0, url.length - 1);

        for(let key of this.Pages.keys()) {
            if(typeof key === 'string') {
                if(key !== url) continue;

                // Stronę znaleziono
                return this.GetPageByKey(key);
            } else {
                if(!key.test(url)) continue;

                // Stronę znaleziono
                return this.GetPageByKey(key);
            }
        }

        throw 'Strona ' + url + ' nie istnieje.';
    }

    protected GetPageByKey(key: string | RegExp) {
        let descriptor = this.Pages.get(key);
        if(descriptor === undefined) throw 'Strona ' + key + ' nie istnieje.';
        if(descriptor.Page === undefined) descriptor.Page = descriptor?.CreatePage();
        return descriptor.Page;
    }
}