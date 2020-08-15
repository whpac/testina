import * as Navbar from './navbar';

import * as PageManager from './1page/pagemanager';
import LoadingIndicator from './1page/loadingindicator';
import HomePage from './pages/home';
import LibraryPage from './pages/library';
import EditTestPage from './pages/edit_test';
import AssignedTestsListPage from './pages/assigned_tests_list';
import SolveTestPage from './pages/solve_test';
import AboutPage from './pages/about';
import AssignmentsPage from './pages/assignments';
import ResultsPage from './pages/results';

// Initialize the page manager
let root = document.getElementById('content-container');
if(root === null) throw 'Błąd ładowania';
let loading_wrapper = new LoadingIndicator('loading-wrapper');

Navbar.Draw();
Navbar.AttachEventHandlers();

PageManager.Initialize(root, loading_wrapper);
PageManager.AddPage('home', new HomePage(), false);
PageManager.AddPage('informacje', new AboutPage(), false);
PageManager.AddPage('testy/biblioteka', new LibraryPage(), false);
PageManager.AddPage('testy/edytuj', new EditTestPage(), true);
PageManager.AddPage('testy/lista', new AssignedTestsListPage(), false);
PageManager.AddPage('testy/rozwiąż', new SolveTestPage(), true);
PageManager.AddPage('testy/przypisane', new AssignmentsPage(), true);
PageManager.AddPage('testy/wyniki', new ResultsPage(), true);

let initial_page = 'home';
let body_url = document.body.dataset.url;
if(body_url !== undefined && body_url != '') initial_page = body_url;
PageManager.GoToPage(initial_page, undefined, true);