import * as EventHandlers from './eventhandlers';

import * as PageManager from './1page/pagemanager.js';
import LoadingIndicator from './1page/loadingindicator.js';
import HomePage from './pages/home';
import LibraryPage from './pages/library';
import EditTestPage from './pages/edit_test';

// Initialize the page manager
let root = document.getElementById('content-container');
if(root === null) throw 'Błąd ładowania';
let loading_wrapper = new LoadingIndicator('loading-wrapper');

PageManager.Initialize(root, loading_wrapper);
PageManager.AddPage('home', new HomePage());
PageManager.AddPage('testy/biblioteka', new LibraryPage());
PageManager.AddPage('testy/edytuj', new EditTestPage());

// Attach necessary event handlers
EventHandlers.AttachHandlersIfDOMLoaded();

document.getElementById('btn-home')?.addEventListener('click', (e) => HandleLinkClick(e, 'home'));
document.getElementById('btn-second')?.addEventListener('click', (e) => HandleLinkClick(e, 'testy/biblioteka'));

// Attach handlers to navbar
let nav_items = document.querySelectorAll('.event-navigation-link');
nav_items.forEach((element) => {
    let anchor = <HTMLAnchorElement>element;
    anchor.addEventListener('click', (e) => HandleLinkClick(e, anchor.dataset.href ?? ''));
});

DisplayPage('home');

export function HandleLinkClick(e: MouseEvent, page_id: string, params?: any){
    if(e.button != 0) return;

    e.preventDefault();
    DisplayPage(page_id, params);
}

function DisplayPage(page: string, params?: any){
    PageManager.GoToPage(page, params);
}
