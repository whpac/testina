import SplashScreen from './splash_screen';
import PageParams, { SimpleObjectRepresentation, UnserializeParams } from './page_params';
import NavigationPrevention from './navigation_prevention';
import CacheManager, { CacheStorages } from '../cache/cache_manager';
import PageStorage from './page_storage';
import PageRequest from './page_request';
import IPage from './ipage';
import ChromeManager from './chrome_manager';

/** Aktualnie wyświetlana strona */
let CurrentPage: (IPage | null) = null;
/** Adres aktualnie wyświetlanej strony */
let CurrentPageId: (string | null) = null;
/** Element, w którym wyświetlane są strony */
let ContentRoot: HTMLElement;
/** Wskaźnik ładowania */
let Splash: (SplashScreen | null) = null;

/** Strona główna */
let HomePage: (IPage | null) = null;
/** Strona logowania */
let LoginPage: (IPage | null) = null;

/** Typ opisujący deskryptor stanu, zapisywany w historii przeglądarki */
type StateDescriptor = {
    page_id: string;
    params: SimpleObjectRepresentation | undefined;
};

/**
 * Inicjalizuje menedżera stron
 * @param root Element HTML, do którego będą ładowane strony
 * @param loading_indicator Wskaźnik ładowania strony
 */
export function Initialize(root: HTMLElement, loading_indicator?: SplashScreen) {
    ContentRoot = root;
    Splash = loading_indicator ?? null;
    window.onpopstate = PopStateHandler;

    window.addEventListener('beforeunload', (event) => {
        // Wyczyść pamięć podręczną
        (async () => (await CacheManager.Open(CacheStorages.Entities)).Purge())();

        if(NavigationPrevention.IsPrevented()) {
            // Anuluj zdarzenie standardową metodą
            event.preventDefault();
            // Następne dwie są dla starszych przeglądarek
            event.returnValue = '';
            return '';
        }
    });
}

/**
 * Przechwytuje kliknięcie linku, wyświetlając odpowiednią stronę
 * @param e Dane zdarzenia, które zostanie anulowane
 * @param page_id Adres strony, do której należy przejść
 * @param params Parametry do przekazania nowej stronie
 */
export function HandleLinkClick(e: MouseEvent, page_id: string, params?: PageParams) {
    if(e.button != 0) return;

    e.preventDefault();
    GoToPage(page_id, params);
}

/**
 * Przechodzi do strony o danym adresie
 * @param page_id Adres strony, do której należy przejść
 * @param params Parametry
 */
export async function GoToPage(page_id: string, params?: PageParams, is_first_page: boolean = false) {
    if(NavigationPrevention.IsPrevented()) {
        let confirm_result = window.confirm('Na tej stronie są niezapisane zmiany.\nCzy chcesz ją opuścić?');
        if(!confirm_result) return;
    }
    NavigationPrevention.ClearReasons();

    try {
        await DisplayPage(page_id, params);
        ChromeManager.SetTitle(CurrentPage?.GetTitle() ?? '');

        let url = CurrentPage?.GetUrlPath();
        if(url !== null && url !== undefined) {
            let fragment = GetFragment(page_id);
            ChromeManager.SetUrlAddress(url + fragment, page_id, params, is_first_page);

            // Fragment należy zresetować ustawiając go na pustą wartość
            window.location.hash = '';
            window.location.hash = fragment;
        }
        return true;
    } catch(e) {
        alert('Nie udało się załadować strony: ' + e);
        return false;
    }
}

/**
 * Wyświetla stronę o podanym adresie
 * @param page_id Adres strony do wyświetlenia
 * @param params Parametr, przekazywany do nowej strony
 */
async function DisplayPage(page_id: string, params?: PageParams): Promise<void> {
    if(CurrentPageId == page_id) return;
    let request = new PageRequest(page_id, params);
    let new_page = PageStorage.GetStorage().GetPage(request);

    try {
        CurrentPage?.UnloadFrom(ContentRoot);
        ChromeManager.MobileHeader.RemoveButtons();
    } catch(e) {

    }

    CurrentPage = new_page;
    CurrentPageId = page_id;

    if(!(await CurrentPage.IsAccessible())) {
        if(HomePage !== null && await HomePage?.IsAccessible()) {
            CurrentPage = HomePage;
            CurrentPageId = 'home';
        } else if(LoginPage !== null && await LoginPage?.IsAccessible()) {
            CurrentPage = LoginPage;
            CurrentPageId = 'login';
        } else {
            CurrentPage = null;
            CurrentPageId = null;
            throw 'Nie masz uprawnień, by wyświetlić tę stronę.';
        }
    }

    let params_or_id: (PageParams | string | undefined) = params;
    let last_slash = page_id.lastIndexOf('/');
    if(last_slash != -1 && params === undefined) {
        params_or_id = page_id.substr(last_slash + 1);
    }

    await CurrentPage.LoadInto(ContentRoot, params_or_id);
    if(Splash?.IsVisible()) window.requestAnimationFrame(() => Splash?.Hide());
}

/**
 * Obsługuje zdarzenie przejścia do poprzedniej strony
 * @param e Dane zdarzenia onpopstate
 */
async function PopStateHandler(e: PopStateEvent) {
    let state = e.state as (StateDescriptor | null | undefined);
    if(state === null || state === undefined) return;

    let page_id = state.page_id;
    let params = state.params;

    if(page_id != null) DisplayPage(page_id, await UnserializeParams(params));
}

export function RegisterHomePage(page: IPage) {
    HomePage = page;
}

export function RegisterLoginPage(page: IPage) {
    LoginPage = page;
}

/**
 * Zwraca element "fragment" z adresu URL, razem ze znakiem #
 * lub pusty ciąg, jeśli fragment nie jest określony
 * @param url Adres URL
 */
function GetFragment(url: string) {
    let hash_pos = url.indexOf('#');
    if(hash_pos == -1) return '';
    return url.substr(hash_pos);
}