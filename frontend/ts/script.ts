import Navbar from './components/chrome/navbar';

import * as PageManager from './1page/page_manager';
import SplashScreen from './1page/splash_screen';
import HomePage from './pages/home';
import LibraryPage from './pages/library';
import EditTestPage from './pages/edit_test';
import AssignedTestsListPage from './pages/assigned_tests_list';
import SolveTestPage from './pages/solve_test';
import AboutPage from './pages/about';
import AssignmentsPage from './pages/assignments';
import ResultsPage from './pages/results';
import LoginPage from './pages/login';
import AuthManager from './auth/auth_manager';
import CacheManager, { CacheStorages } from './cache/cache_manager';
import HelpPage from './pages/help';
import PageStorage from './1page/page_storage';
import ChromeManager from './1page/chrome_manager';
import SurveysPage from './pages/surveys';
import FillSurveyPage from './pages/fill_survey';
import EditSurveyPage from './pages/edit_survey';
import MobileHeader from './components/chrome/mobile_header';

try {
    // Odwołanie do obiektu, gdzie będzie wyświetlana strona
    let root = document.getElementById('content-container');
    if(root === null) throw 'Błąd ładowania';
    let splash_screen = new SplashScreen('loading-wrapper');

    // Inicjalizacja paska nawigacji
    ChromeManager.ApplicationNavbar = new Navbar('main-nav');
    (async () => {
        if(await AuthManager.IsAuthorized()) {
            ChromeManager.ApplicationNavbar.Draw();
            root.classList.remove('login');
        } else {
            ChromeManager.ApplicationNavbar.Destroy();
            root.classList.add('login');
        }
    })();

    // Inicjalizacja menedżera stron
    let mobile_header = document.getElementById('mobile-header');
    if(mobile_header === null) throw 'Nie można odnaleźć nagłówka strony.';

    let header = new MobileHeader(mobile_header);
    ChromeManager.MobileHeader = header;
    PageManager.Initialize(root, splash_screen);

    let pages = PageStorage.GetStorage();
    pages.RegisterPage('ankiety', { CreatePage: () => new SurveysPage() });
    pages.RegisterPage(/^ankiety\/edytuj(\/[0-9]+)?$/, { CreatePage: () => new EditSurveyPage() });
    pages.RegisterPage('ankiety/wypełnij', { CreatePage: () => new FillSurveyPage() });
    pages.RegisterPage('home', { CreatePage: () => new HomePage() });
    pages.RegisterPage('informacje', { CreatePage: () => new AboutPage() });
    pages.RegisterPage('pomoc', { CreatePage: () => new HelpPage() });
    pages.RegisterPage('testy/biblioteka', { CreatePage: () => new LibraryPage() });
    pages.RegisterPage(/^testy\/edytuj(\/[0-9]+)?$/, { CreatePage: () => new EditTestPage() });
    pages.RegisterPage('testy/lista', { CreatePage: () => new AssignedTestsListPage() });
    pages.RegisterPage(/^testy\/rozwiąż(\/[0-9]+)?$/, { CreatePage: () => new SolveTestPage() });
    pages.RegisterPage(/^testy\/przypisane(\/[0-9]+)?$/, { CreatePage: () => new AssignmentsPage() });
    pages.RegisterPage(/^testy\/wyniki(\/[0-9]+)?$/, { CreatePage: () => new ResultsPage() });
    pages.RegisterPage('zaloguj', { CreatePage: () => new LoginPage() });

    PageManager.RegisterHomePage(new HomePage());
    PageManager.RegisterLoginPage(new LoginPage());

    // Zarejestruj procedury do wykonania po za- i wylogowaniu
    AuthManager.AddEventListener('login', async () => {
        (await CacheManager.Open(CacheStorages.Entities)).Purge();
        ChromeManager.ApplicationNavbar.Draw();
        root?.classList.remove('login');
    });
    AuthManager.AddEventListener('logout', async () => {
        (await CacheManager.Open(CacheStorages.Entities)).Purge();
        ChromeManager.ApplicationNavbar.Destroy();
        root?.classList.add('login');
        PageManager.GoToPage('zaloguj');
    });

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
    let url_path = decodeURI(ReadPageFromURL());

    // Jeżeli strona do załadowania nie jest pustym ciągiem - załaduj ją
    if(url_path != '') initial_page = url_path;

    // Załaduj stronę
    let is_success = await PageManager.GoToPage(initial_page, undefined, true);

    if(!is_success) {
        PageManager.GoToPage('home', undefined, true);
    }
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