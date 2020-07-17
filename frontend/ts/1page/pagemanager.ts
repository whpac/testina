import Page from '../components/basic/page';
import LoadingIndicator from './loadingindicator';
import PageParams, { SimpleObjectRepresentation } from './pageparams';
import Test from '../entities/test';
import Assignment from '../entities/assignment';
import NavigationPrevention from './navigationprevention';

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

/** Typ opisujący zbiór stron */
type PageList = {
    [url: string]: Page;
}

/** Typ opisujący deskryptor stanu, zapisywany w historii przeglądarki */
type StateDescriptor = {
    page_id: string;
    params: SimpleObjectRepresentation | undefined;
}

/**
 * Inicjalizuje menedżera stron
 * @param root Element HTML, do którego będą ładowane strony
 * @param loading_indicator Wskaźnik ładowania strony
 */
export function Initialize(root: HTMLElement, loading_indicator?: LoadingIndicator){
    ContentRoot = root;
    LoadingWrapper = loading_indicator ?? null;
    window.onpopstate = PopStateHandler;

    MobileHeader = document.getElementById('mobile-header-title');

    window.addEventListener('beforeunload', (event) => {
        if(NavigationPrevention.IsPrevented()){
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
 */
export function AddPage(page_id: string, page: Page){
    Pages[page_id] = page;
}

/**
 * Przechwytuje kliknięcie linku, wyświetlając odpowiednią stronę
 * @param e Dane zdarzenia, które zostanie anulowane
 * @param page_id Adres strony, do której należy przejść
 * @param params Parametry do przekazania nowej stronie
 */
export function HandleLinkClick(e: MouseEvent, page_id: string, params?: PageParams){
    if(e.button != 0) return;

    e.preventDefault();
    GoToPage(page_id, params);
}

/**
 * Przechodzi do strony o danym adresie
 * @param page_id Adres strony, do której należy przejść
 * @param params Parametry
 */
export function GoToPage(page_id: string, params?: PageParams){
    if(NavigationPrevention.IsPrevented()){
        let confirm_result = window.confirm('Na tej stronie są niezapisane zmiany.\nCzy chcesz ją opuścić?');
        if(!confirm_result) return;
    }
    NavigationPrevention.ClearReasons();

    DisplayPage(page_id, params).then(async () => {
        SetTitle(await CurrentPage?.GetTitle() ?? '');
        AlterCurrentUrl(CurrentPage?.GetUrlPath() ?? '', page_id, params);
    }).catch((r) => {alert('Nie udało się załadować strony: ' + r)});
}

/**
 * Wyświetla stronę o podanym adresie
 * @param page_id Adres strony do wyświetlenia
 * @param params Parametr, przekazywany do nowej strony
 */
async function DisplayPage(page_id: string, params?: PageParams): Promise<void>{
        if(Pages[page_id] === undefined) return Promise.reject(page_id + ' nie istnieje.');
        if(CurrentPageId == page_id) return;

        LoadingWrapper?.Display()
        CurrentPage?.UnloadFrom(ContentRoot);

        CurrentPage = Pages[page_id];
        CurrentPageId = page_id;

        await CurrentPage.LoadInto(ContentRoot, params);
        window.requestAnimationFrame(() => LoadingWrapper?.Hide());
}

/**
 * Obsługuje zdarzenie przejścia do poprzedniej strony
 * @param e Dane zdarzenia onpopstate
 */
function PopStateHandler(e: PopStateEvent){
    let state = e.state as (StateDescriptor | null | undefined);
    if(state === null || state === undefined) return;

    let page_id = state.page_id;
    let params = state.params;

    if(page_id != null) DisplayPage(page_id, UnserializeParams(params));
}

/**
 * Zmienia aktualny adres wyświetlany na pasku adresu
 * @param new_url Nowy adres URL (względny)
 * @param page_id Adres strony skojarzony z adresem URL
 * @param params Parametr strony, do zapisania w historii przeglądarki
 */
function AlterCurrentUrl(new_url: string, page_id: string, params?: PageParams){
    history.pushState({page_id: page_id, params: params?.GetSimpleRepresentation()}, '', new_url);
}

/**
 * Ustawia tekst widoczny na pasku tytułu w przeglądarce
 * @param new_title Nowy tytuł
 */
export function SetTitle(new_title: string){
    if(new_title == ''){
        document.title = 'Lorem Ipsum';
        if(MobileHeader !== null) MobileHeader.textContent = document.title;
    }else{
        document.title = new_title + ' – Lorem Ipsum';
        if(MobileHeader !== null) MobileHeader.textContent = new_title;
    }
}

/**
 * Tworzy obiekt z prostej reprezentacji
 * @param params Prosta reprezentacja obiektu
 */
function UnserializeParams(params?: SimpleObjectRepresentation): (PageParams | undefined){
    switch(params?.type){
        case 'test': return new Test(params.id);
        case 'assignment': return new Assignment(params.id);
    }
    return undefined;
}