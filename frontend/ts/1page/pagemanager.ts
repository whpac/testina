import Page from '../components/basic/page';
import LoadingIndicator from './loadingindicator';
import PageParams, { SimpleObjectRepresentation } from './pageparams';
import NavigationPrevention from './navigationprevention';
import TestLoader from '../entities/loaders/testloader';
import AssignmentLoader from '../entities/loaders/assignmentloader';
import CacheManager, { CacheStorages } from '../cache/cache_manager';

/** Lista zarejestrowanych stron */
let Pages: PageList = {};
/** Aktualnie wyświetlana strona */
let CurrentPage: (Page | null) = null;
/** Adres aktualnie wyświetlanej strony */
let CurrentPageId: (string | null) = null;
/** Element, w którym wyświetlane są strony */
let ContentRoot: HTMLElement;
/** Wskaźnik ładowania */
let LoadingWrapper: (LoadingIndicator | null) = null;
/** Treść mobilnego nagłówka */
let MobileHeader: HTMLElement | null;

/** Strona główna */
let HomePage: (Page | null) = null;
/** Strona logowania */
let LoginPage: (Page | null) = null;

/** Typ opisujący zbiór stron */
type PageList = {
    [url: string]: { page: Page, accepts_argument: boolean; };
};

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
export function Initialize(root: HTMLElement, loading_indicator?: LoadingIndicator) {
    ContentRoot = root;
    LoadingWrapper = loading_indicator ?? null;
    window.onpopstate = PopStateHandler;

    MobileHeader = document.getElementById('mobile-header-title');

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
 * Dodaje stronę do rejestru
 * @param page_id Adres strony
 * @param page Strona
 * @param accepts_argument Czy strona przyjmuje argument
 */
export function AddPage(page_id: string, page: Page, accepts_argument: boolean) {
    Pages[page_id] = { page: page, accepts_argument: accepts_argument };
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
        SetTitle(await CurrentPage?.GetTitle() ?? '');

        let url = CurrentPage?.GetUrlPath();
        if(url !== null && url !== undefined)
            AlterCurrentUrl(url, page_id, params, is_first_page);
    } catch(e) {
        alert('Nie udało się załadować strony: ' + e);
    }
}

/**
 * Wyświetla stronę o podanym adresie
 * @param page_id Adres strony do wyświetlenia
 * @param params Parametr, przekazywany do nowej strony
 */
async function DisplayPage(page_id: string, params?: PageParams): Promise<void> {
    let bare_page_id = GetPageId(page_id, params !== undefined);
    if(bare_page_id === undefined) return Promise.reject(page_id + ' nie istnieje.');
    if(CurrentPageId == page_id) return;

    LoadingWrapper?.Display();
    CurrentPage?.UnloadFrom(ContentRoot);

    CurrentPage = Pages[bare_page_id].page;
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

    let params_or_id: (PageParams | number | undefined) = params;
    if(bare_page_id != page_id && params === undefined) {
        params_or_id = parseInt(page_id.substr(bare_page_id.length + 1));
    }

    await CurrentPage.LoadInto(ContentRoot, params_or_id);
    window.requestAnimationFrame(() => LoadingWrapper?.Hide());
}

/**
 * Zwraca adres strony bez argumentów
 * @param page_id_with_args Adres strony z opcjonalnymi argumentami
 * @param object_argument_passed Czy przekazano obiekt z argumentem
 */
function GetPageId(page_id_with_args: string, object_argument_passed: boolean) {
    if(Pages[page_id_with_args] !== undefined && (!Pages[page_id_with_args].accepts_argument || object_argument_passed))
        return page_id_with_args;

    let shorter_name = page_id_with_args.substr(0, page_id_with_args.lastIndexOf('/'));
    if(Pages[shorter_name] !== undefined && Pages[shorter_name].accepts_argument)
        return shorter_name;

    return undefined;
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

/**
 * Zmienia aktualny adres wyświetlany na pasku adresu
 * @param new_url Nowy adres URL (względny)
 * @param page_id Adres strony skojarzony z adresem URL
 * @param params Parametr strony, do zapisania w historii przeglądarki
 */
function AlterCurrentUrl(new_url: string, page_id: string, params?: PageParams, replace: boolean = false) {
    if(replace) {
        history.replaceState({ page_id: page_id, params: params?.GetSimpleRepresentation() }, '', new_url);
    } else {
        history.pushState({ page_id: page_id, params: params?.GetSimpleRepresentation() }, '', new_url);
    }
}

/**
 * Ustawia tekst widoczny na pasku tytułu w przeglądarce
 * @param new_title Nowy tytuł
 */
export function SetTitle(new_title: string) {
    if(new_title == '') {
        document.title = 'Lorem Ipsum';
        if(MobileHeader !== null) MobileHeader.textContent = document.title;
    } else {
        document.title = new_title + ' – Lorem Ipsum';
        if(MobileHeader !== null) MobileHeader.textContent = new_title;
    }
}

/**
 * Tworzy obiekt z prostej reprezentacji
 * @param params Prosta reprezentacja obiektu
 */
async function UnserializeParams(params?: SimpleObjectRepresentation): Promise<(PageParams | undefined)> {
    switch(params?.type) {
        case 'test': return await TestLoader.LoadById(params.id);
        case 'assignment': return await AssignmentLoader.LoadById(params.id);
    }
    return undefined;
}

export function RegisterHomePage(page: Page) {
    HomePage = page;
}

export function RegisterLoginPage(page: Page) {
    LoginPage = page;
}