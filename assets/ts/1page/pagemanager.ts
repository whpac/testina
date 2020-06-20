import Page from './page';
import LoadingIndicator from './loadingindicator';
import PageParams from './pageparams';
import Test from '../entities/test';

let Pages: PageList = {};
let CurrentPage: (Page | null) = null;
let CurrentPageId: (string | null) = null;
let ContentRoot: HTMLElement;
let LoadingWrapper: (LoadingIndicator | null) = null;

let PreventFromNavigationReasons = new Set<string>();

type PageList = {
    [url: string]: Page;
}

export function Initialize(root: HTMLElement, loading_indicator?: LoadingIndicator){
    ContentRoot = root;
    LoadingWrapper = loading_indicator ?? null;
    window.onpopstate = PopStateHandler;

    window.addEventListener('beforeunload', (event) => {
        if(IsPreventedFromNavigation()){
            // Cancel the event as stated by the standard.
            event.preventDefault();
            // Chrome requires returnValue to be set.
            event.returnValue = '';
            return '';
        }
    });
}

export function AddPage(page_id: string, page: Page){
    Pages[page_id] = page;
}

export function GoToPage(page_id: string, params?: PageParams){
    if(IsPreventedFromNavigation()){
        let confirm_result = window.confirm('Na tej stronie są niezapisane zmiany.\nCzy chcesz ją opuścić?');
        if(!confirm_result) return;
    }
    PreventFromNavigationReasons.clear();

    DisplayPage(page_id, params).then(async () => {
        SetTitle(await CurrentPage?.GetTitle() ?? '');
        AlterCurrentUrl(CurrentPage?.GetUrlPath() ?? '', page_id, params);
    }).catch((r) => {alert('Nie udało się załadować strony: ' + r)});
}

/**
 * When called, there will be a prompt before navigating to another page
 * @param reason identifier representing the prevention (not displayed to user)
 */
export function PreventFromNavigation(reason: string){
    PreventFromNavigationReasons.add(reason);
}

/**
 * Cancels the prevention with specified identifier
 * @param reason identifier of prevention to cancel
 */
export function UnpreventFromNavigation(reason: string){
    PreventFromNavigationReasons.delete(reason);
}

/**
 * Checks if there is any active navigation prevention
 */
export function IsPreventedFromNavigation(){
    return PreventFromNavigationReasons.size != 0;
}

/**
 * Navigates to page
 * @param page_id identifier of page to navigate to
 * @param params parameters passed to the new page
 */
async function DisplayPage(page_id: string, params?: PageParams): Promise<void>{
        if(Pages[page_id] === undefined) return Promise.reject(page_id + ' doesn\'t exist.');
        if(CurrentPageId == page_id) return;

        LoadingWrapper?.Display()
        CurrentPage?.UnloadFrom(ContentRoot);

        CurrentPage = Pages[page_id];
        CurrentPageId = page_id;

        await CurrentPage.LoadInto(ContentRoot, params);
        window.requestAnimationFrame(() => LoadingWrapper?.Hide());
}

function PopStateHandler(e: PopStateEvent){
    let state = e.state;
    if(state === null || state === undefined) return;

    let page_id = state.page_id as (string | null);
    let params = state.params as ({type: string, id: number} | undefined);

    if(page_id != null) DisplayPage(page_id, UnserializeParams(params));
}

function AlterCurrentUrl(new_url: string, page_id: string, params?: PageParams){
    history.pushState({page_id: page_id, params: params?.GetSimpleRepresentation()}, '', new_url);
}

export function SetTitle(new_title: string){
    if(new_title == '') document.title = 'Lorem Ipsum';
    else document.title = new_title + ' – Lorem Ipsum';
}

function UnserializeParams(params?: {type: string, id: number}): (PageParams | undefined){
    switch(params?.type){
        case 'test': return new Test(params.id);
    }
    return undefined;
}