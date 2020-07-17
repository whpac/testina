import * as EventHandlers from './eventhandlers';

import * as PageManager from './1page/pagemanager';
import LoadingIndicator from './1page/loadingindicator';
import HomePage from './pages/home';
import LibraryPage from './pages/library';
import EditTestPage from './pages/edit_test';
import AssignedTestsListPage from './pages/assigned_tests_list';
import SolveTestPage from './pages/solve_test';

// Initialize the page manager
let root = document.getElementById('content-container');
if(root === null) throw 'Błąd ładowania';
let loading_wrapper = new LoadingIndicator('loading-wrapper');

PageManager.Initialize(root, loading_wrapper);
PageManager.AddPage('home', new HomePage());
PageManager.AddPage('testy/biblioteka', new LibraryPage());
PageManager.AddPage('testy/edytuj', new EditTestPage());
PageManager.AddPage('testy/lista', new AssignedTestsListPage());
PageManager.AddPage('testy/rozwiąż', new SolveTestPage());

// Attach necessary event handlers
EventHandlers.AttachHandlersIfDOMLoaded();

document.getElementById('btn-home')?.addEventListener('click', (e) => PageManager.HandleLinkClick(e, 'home'));
document.getElementById('btn-second')?.addEventListener('click', (e) => PageManager.HandleLinkClick(e, 'testy/biblioteka'));

// Attach handlers to navbar
let nav_items = document.querySelectorAll('.event-navigation-link');
nav_items.forEach((element) => {
    let anchor = <HTMLAnchorElement>element;
    anchor.addEventListener('click', (e) => PageManager.HandleLinkClick(e, anchor.dataset.href ?? ''));
});

PageManager.GoToPage('home');