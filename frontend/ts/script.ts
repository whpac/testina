import Navbar from './navbar';

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
import LoginPage from './pages/login';

let AppNavbar: Navbar;

try {
    // Odwołanie do obiektu, gdzie będzie wyświetlana strona
    let root = document.getElementById('content-container');
    if(root === null) throw 'Błąd ładowania';
    let loading_wrapper = new LoadingIndicator('loading-wrapper');

    // Inicjalizacja paska nawigacji
    AppNavbar = new Navbar('main-nav');
    AppNavbar.Draw();

    // Inicjalizacja menedżera stron
    PageManager.Initialize(root, loading_wrapper);
    PageManager.AddPage('home', new HomePage(), false);
    PageManager.AddPage('informacje', new AboutPage(), false);
    PageManager.AddPage('testy/biblioteka', new LibraryPage(), false);
    PageManager.AddPage('testy/edytuj', new EditTestPage(), true);
    PageManager.AddPage('testy/lista', new AssignedTestsListPage(), false);
    PageManager.AddPage('testy/rozwiąż', new SolveTestPage(), true);
    PageManager.AddPage('testy/przypisane', new AssignmentsPage(), true);
    PageManager.AddPage('testy/wyniki', new ResultsPage(), true);
    PageManager.AddPage('zaloguj', new LoginPage(), false);

    PageManager.RegisterHomePage(new HomePage());
    PageManager.RegisterLoginPage(new LoginPage());

    // Załaduj stronę początkową
    LoadInitialPage();
} catch(e) {
    alert('Wystąpił błąd: ' + e.toString() + '.');
}

/**
 * Ładuje stronę zgodnie z danymi otrzymanymi z serwera
 */
export async function LoadInitialPage() {
    // Domyślna strona - w przypadku, gdy konkretny adres nie zostanie zdefiniowany
    let initial_page = 'home';
    let url_path = ReadPageFromURL();

    // Jeżeli strona do załadowania nie jest pustym ciągiem - załaduj ją
    if(url_path != '') initial_page = url_path;

    // Załaduj stronę
    PageManager.GoToPage(initial_page, undefined, true);
}

/**
 * Zwraca adres strony, odczytany z adresu URL
 */
function ReadPageFromURL() {
    let base_element = document.querySelector('base');
    if(base_element === null) {
        // Zwraca ścieżkę, bez ukośnika z przodu
        return window.location.pathname.substr(1);
    } else {
        let base_path = base_element.href;
        let url_path = window.location.href;
        if(url_path.startsWith(base_path)) {
            // Zwraca ścieżkę, ale bez części danej przez <base>
            return url_path.substr(base_path.length ?? 0);
        } else {
            return window.location.pathname.substr(1);
        }
    }
}