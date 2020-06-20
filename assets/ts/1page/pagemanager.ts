import Page from './page';
import LoadingIndicator from './loadingindicator';
import PageParams from './pageparams';
import Test from '../entities/test';

let Pages: PageList = {};
let CurrentPage: (Page | null) = null;
let CurrentPageId: (string | null) = null;
let ContentRoot: HTMLElement;
let LoadingWrapper: (LoadingIndicator | null) = null;

type PageList = {
    [url: string]: Page;
}

export function Initialize(root: HTMLElement, loading_indicator?: LoadingIndicator){
    ContentRoot = root;
    LoadingWrapper = loading_indicator ?? null;
    window.onpopstate = PopStateHandler;
}

export function AddPage(page_id: string, page: Page){
    Pages[page_id] = page;
}

export function GoToPage(page_id: string, params?: PageParams){
    DisplayPage(page_id, params).then(async () => {
        SetTitle(await CurrentPage?.GetTitle() ?? '');
        AlterCurrentUrl(CurrentPage?.GetUrlPath() ?? '', page_id, params);
    }).catch((r) => {alert('Nie udało się załadować strony: ' + r)});
}

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

    let unserialized_params: (PageParams | undefined) = undefined;
    switch(params?.type){
        case 'test':
            unserialized_params = new Test(params.id);
            break;
    }

    if(page_id != null) DisplayPage(page_id, unserialized_params);
}

function AlterCurrentUrl(new_url: string, page_id: string, params?: PageParams){
    history.pushState({page_id: page_id, params: params?.GetSimpleRepresentation()}, '', new_url);
}

function SetTitle(new_title: string){
    if(new_title == '') document.title = 'Lorem Ipsum';
    else document.title = new_title + ' – Lorem Ipsum';
}