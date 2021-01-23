import Navbar from './components/chrome/navbar';

import * as PageManager from './1page/page_manager';
import SplashScreen from './1page/splash_screen';
import LibraryPage from './pages/library';
import EditTestPage from './pages/edit_test';
import AssignedTestsListPage from './pages/assigned_tests_list';
import SolveTestPage from './pages/solve_test';
import AboutPage from './pages/about';
import AssignmentsPage from './pages/assignments';
import ResultsPage from './pages/results';
import AuthManager from './auth/auth_manager';
import CacheManager, { CacheStorages } from './cache/cache_manager';
import HelpPage from './pages/help';
import PageStorage from './1page/page_storage';
import ChromeManager from './1page/chrome_manager';
import SurveysPage from './pages/surveys';
import FillSurveyPage from './pages/fill_survey';
import EditSurveyPage from './pages/edit_survey';
import MobileHeader from './components/chrome/mobile_header';
import UserLoader from './entities/loaders/userloader';
import LoginWithOfficePage from './pages/login_office';
import Toast from './components/basic/toast';
import SurveyResultsPage from './pages/survey_results';
import AccountPage from './pages/account';
import AttemptAnswers from './pages/attempt_answers';
import XHR from './network/xhr';

window.addEventListener('error', errorReporter);
window.addEventListener('unhandledrejection', errorReporter);

try {
    ChromeManager.ApplySiteTheme();

    // Odwołanie do obiektu, gdzie będzie wyświetlana strona
    let root = document.getElementById('content-container');
    if(root === null) throw 'Błąd ładowania';
    let splash_screen = new SplashScreen('loading-wrapper');

    // Inicjalizacja menedżera stron
    let mobile_header = document.getElementById('mobile-header');
    if(mobile_header === null) throw 'Nie można odnaleźć nagłówka strony.';

    let header = new MobileHeader(mobile_header);
    ChromeManager.MobileHeader = header;
    PageManager.Initialize(root, splash_screen);

    let pages = PageStorage.GetStorage();
    pages.RegisterPage('ankiety', { CreatePage: () => new SurveysPage() });
    pages.RegisterPage(/^ankiety\/edytuj(\/[0-9]+)?$/, { CreatePage: () => new EditSurveyPage() });
    pages.RegisterPage(/^ankiety\/wyniki(\/[0-9]+)?$/, { CreatePage: () => new SurveyResultsPage() });
    pages.RegisterPage(/^ankiety\/wypełnij(\/[0-9a-zA-Z]+)?$/, { CreatePage: () => new FillSurveyPage() });
    pages.RegisterPage('informacje', { CreatePage: () => new AboutPage() });
    pages.RegisterPage('konto', { CreatePage: () => new AccountPage() });
    pages.RegisterPage(/^podejścia(\/[0-9]+)?$/, { CreatePage: () => new AttemptAnswers() });
    pages.RegisterPage('pomoc', { CreatePage: () => new HelpPage() });
    pages.RegisterPage('testy/biblioteka', { CreatePage: () => new LibraryPage() });
    pages.RegisterPage(/^testy\/edytuj(\/[0-9]+)?$/, { CreatePage: () => new EditTestPage() });
    pages.RegisterPage('testy/lista', { CreatePage: () => new AssignedTestsListPage() });
    pages.RegisterPage(/^testy\/rozwiąż(\/[0-9]+)?$/, { CreatePage: () => new SolveTestPage() });
    pages.RegisterPage(/^testy\/przypisane(\/[0-9]+)?$/, { CreatePage: () => new AssignmentsPage() });
    pages.RegisterPage(/^testy\/wyniki(\/[0-9]+)?$/, { CreatePage: () => new ResultsPage() });
    pages.RegisterPage('zaloguj/office', { CreatePage: () => new LoginWithOfficePage() });

    PageManager.RegisterHomePage(() => new AssignedTestsListPage());
    PageManager.RegisterLoginPage(() => new LoginWithOfficePage());

    // Zarejestruj procedury do wykonania po za- i wylogowaniu
    AuthManager.AddEventListener('login', async () => {
        (await CacheManager.Open(CacheStorages.Entities)).Purge();
        ChromeManager.ApplicationNavbar?.Draw();
        root?.classList.remove('login');
    });
    AuthManager.AddEventListener('logout', async () => {
        ChromeManager.ApplicationNavbar?.Destroy();
        UserLoader.ClearCurrentUserCache();
        root?.classList.add('login');
        await (await CacheManager.Open(CacheStorages.Entities)).Purge();
    });

    // Inicjalizacja paska nawigacji
    ChromeManager.ApplicationNavbar = new Navbar('main-nav');
    (async () => {
        try {
            if(await AuthManager.IsAuthorized(true)) {
                ChromeManager.ApplicationNavbar?.Draw();
                root.classList.remove('login');
            } else {
                ChromeManager.ApplicationNavbar?.Destroy();
                root.classList.add('login');
            }

            // Załaduj stronę początkową
            await LoadInitialPage();
        } catch(e) {
            let message = '.';
            if('Message' in e) message = ': ' + e.Message;

            new Toast('Nie udało się wczytać strony' + message).Show();
        }
    })();
} catch(e) {
    alert('Wystąpił błąd: ' + e.toString() + '.');
}

/**
 * Ładuje stronę zgodnie z danymi otrzymanymi z serwera
 */
export async function LoadInitialPage() {
    // Domyślna strona - w przypadku, gdy konkretny adres nie zostanie zdefiniowany
    let default_page = 'testy/lista';
    let initial_page = default_page;
    let url_path = decodeURI(ReadPageFromURL());

    // Jeżeli strona do załadowania nie jest pustym ciągiem - załaduj ją
    if(url_path != '') initial_page = url_path;
    if(url_path.startsWith('?') || url_path.startsWith('#')) initial_page = default_page + url_path;

    // Załaduj stronę
    let is_success = await PageManager.GoToPage(initial_page, undefined, true);

    if(!is_success) {
        PageManager.GoToPage(default_page, undefined, true);
    }
}

/**
 * Zwraca adres strony, odczytany z adresu URL
 */
export function ReadPageFromURL() {
    let base_element = document.querySelector('base');
    let base_path: string;
    let url_path = window.location.href;

    if(base_element === null) {
        base_path = window.location.origin;
    } else {
        base_path = base_element.href;
    }

    let relative_url: string;
    if(url_path.startsWith(base_path)) {
        // Zwraca ścieżkę, ale bez adresu bazowego (nazwy hosta albo określonego przez <base>)
        relative_url = url_path.substr(base_path.length);
    } else {
        relative_url = url_path.substr(window.location.origin.length);
    }

    // Jeżeli nazwa strony zaczyna się od ukośnika, utnij go
    if(relative_url.startsWith('/')) relative_url = relative_url.substr(1);

    if(relative_url.startsWith('office_login?')) relative_url = ReadStateFromOfficeLogin();

    return relative_url;
}

function ReadStateFromOfficeLogin() {
    let query_string = window.location.search;
    let url_params = new URLSearchParams(query_string);

    if(!url_params.has('state')) return '';

    let page = url_params.get('state');
    if(page === null) return '';

    return page;
}

async function errorReporter(e: PromiseRejectionEvent | ErrorEvent) {
    let message = '';

    if(e instanceof ErrorEvent) {
        message = e.message;
    } else if(e instanceof PromiseRejectionEvent) {
        message = e.reason;

        if(e.reason instanceof Error) {
            message = e.reason.message + '; ' + e.reason.stack;
        } else if('toString' in e.reason && typeof message.toString === 'function') {
            message = e.reason.toString();
        }
    }

    try {
        await XHR.PerformRequest('api/file_error', {
            Method: 'POST', RequestData: {
                error: message
            }
        });
        return true;
    } catch(e) {

    }
}