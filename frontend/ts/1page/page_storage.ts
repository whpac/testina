import IPage from './ipage';
import PageRequest from './page_request';

type PageFactory = () => IPage;
type PageDescriptor = {
    AcceptsArgument: boolean;
    CreatePage: PageFactory;
};

/**
 * Klasa służąca do przechowywania stron
 */
export default class PageStorage {
    /** Przechowuje instancję PageStorage */
    protected static _PageStorage: PageStorage | undefined;

    /** Przechowuje dane o niezainicjalizowanych jeszcze stronach */
    protected RawPages: Map<string, PageDescriptor>;
    /** Przechowuje już zainicjalizowane strony */
    protected Pages: Map<string, IPage>;

    public static GetStorage() {
        if(this._PageStorage === undefined) {
            this._PageStorage = new PageStorage();
        }
        return this._PageStorage;
    }

    protected static StripArguments(page_id_with_arguments: string) {
        return page_id_with_arguments.substr(0, page_id_with_arguments.lastIndexOf('/'));
    }

    public constructor() {
        this.RawPages = new Map<string, PageDescriptor>();
        this.Pages = new Map<string, IPage>();
    }

    public RegisterPage(page_id: string, descriptor: PageDescriptor) {
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
        let params_exist = request.Params !== undefined;

        // Jeżeli strona o danym id istnieje i odpowiada warunkowi params_exist, zwróć ją
        let page = this.GetPageConditional(url, params_exist);
        if(page !== undefined) return page;

        let stripped_page_id = PageStorage.StripArguments(url);
        if(!params_exist) {
            // Jeśli strona, która przyjmuje arugment istnieje, zwróć ją
            page = this.GetPageConditional(stripped_page_id, true);
            if(page !== undefined) return page;
        }

        let descriptor: PageDescriptor | undefined;
        let new_page: IPage;

        descriptor = this.GetPageDescriptorConditional(url, params_exist);
        if(descriptor !== undefined) {
            new_page = descriptor.CreatePage();
            this.Pages.set(url, new_page);
        } else {
            if(!params_exist) {
                descriptor = this.GetPageDescriptorConditional(stripped_page_id, true);
                if(descriptor !== undefined) {
                    new_page = descriptor.CreatePage();
                    this.Pages.set(url, new_page);
                } else {
                    throw 'Strona ' + url + ' nie istnieje.';
                }
            } else {
                throw 'Strona ' + url + ' nie istnieje.';
            }
        }

        return new_page;
    }

    protected GetPageDescriptorConditional(page_id: string, accepts_argument: boolean) {
        // Jeśli strona nie istnieje, zwróć undefined
        if(!this.RawPages.has(page_id)) return undefined;

        let page_descriptor = this.RawPages.get(page_id) as PageDescriptor;

        // Jeśli strona istnieje, sprawdź, czy spełnia warunek
        if(page_descriptor.AcceptsArgument == accepts_argument) return page_descriptor;

        return undefined;
    }

    protected GetPageConditional(page_id: string, accepts_argument: boolean): IPage | undefined {
        // Sprawdź, czy strona o podanym id pasuje do zapytania, jeśli nie - zwróć undefined
        let descriptor = this.GetPageDescriptorConditional(page_id, accepts_argument);
        if(descriptor === undefined) return undefined;

        // Jeśli strona nie istnieje, zwróć undefined
        if(!this.Pages.has(page_id)) return undefined;
        return this.Pages.get(page_id) as IPage;
    }
}