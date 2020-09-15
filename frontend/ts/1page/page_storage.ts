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
    protected RawPages: Map<PageKey, PageDescriptor>;
    /** Przechowuje już zainicjalizowane strony */
    protected Pages: Map<PageKey, IPage>;

    public static GetStorage() {
        if(this._PageStorage === undefined) {
            this._PageStorage = new PageStorage();
        }
        return this._PageStorage;
    }

    public constructor() {
        this.RawPages = new Map<PageKey, PageDescriptor>();
        this.Pages = new Map<PageKey, IPage>();
    }

    public RegisterPage(page_id: PageKey, descriptor: PageDescriptor) {
        this.RawPages.set(page_id, descriptor);
    }

    /**
     * Funkcja zwraca stronę na podstawie żądania. Jednocześnie interpretuje adres
     * w poszukiwaniu parametrów. Istnieją trzy możliwe sytuacje:
     * 
     * 1. Strona nie oczekuje parametru - wtedy poszukuje się strony o dokładnie takim id,
     * jak podany.
     * 
     * 2. Strona oczekuje parametru i przekazano go jako obiekt - analogicznie jak w 1.
     * 
     * 3. Strona oczekuje parametru, ale nie przekazano obiektu - odcina się ostatnią część
     * adresu i sprawdza, czy strona o takim id istnieje.
     * 
     * @param request Żądanie
     */
    public GetPage(request: PageRequest) {
        let url = request.PageId;

        // Usuń ukośniki z końca adresu
        while(url.endsWith('/')) url = url.substr(0, url.length - 1);

        for(let key of this.RawPages.keys()) {
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
        let descriptor = this.RawPages.get(key);
        if(descriptor === undefined) throw 'Strona ' + key + ' nie istnieje.';
        if(descriptor.Page === undefined) descriptor.Page = descriptor?.CreatePage();
        return descriptor.Page;
    }
}