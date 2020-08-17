import UserLoader from '../entities/loaders/userloader';
import * as XHR from '../utils/xhr';
import NavigationPrevention from '../1page/navigationprevention';

export type AuthResult = {
    is_success: boolean;
    reason: number | null;
};

/** Typ reprezentujący obsługiwane nazwy zdarzeń */
type EventName = 'login' | 'logout';

/** Typ funkcji obsługi zdarzeń */
type EventListener = () => void;

/** Zbiór procedur obsługi zdarzeń */
type EventListenerCollection = {
    [event_name: string]: Set<EventListener>;
};

export default class AuthManager {
    private static EventListeners: EventListenerCollection = {};

    /**
     * Sprawdza, czy bieżący użytkownik jest zalogowany
     */
    public static async IsAuthorized() {
        return (await this.GetCurrentUser(true)) !== undefined;
    }

    /**
     * Zwraca bieżącego użytkownika
     * @param force Czy załadować bezpośrednio z serwera
     */
    public static async GetCurrentUser(force: boolean = false) {
        return UserLoader.GetCurrent(force);
    }

    /**
     * Próbuje zalogować z użyciem podanych poświadczeń
     * @param username Nazwa użytkownika
     * @param password Hasło
     */
    public static async TryToLogIn(username: string, password: string) {
        let payload = {
            login: username,
            password: password
        };

        let result = await XHR.PerformRequest('api/session', 'POST', payload);
        let response = result.Response as AuthResult;

        if(response.is_success) {
            AuthManager.FireEvent('login');
        }

        return response;
    }

    /**
     * Wylogowuje bieżącego użytkownika
     */
    public static async LogOut() {
        if(NavigationPrevention.IsPrevented()) {
            if(!confirm('Na tej stronie są niezapisane zmiany.\nCzy na pewno chcesz się wylogować?')) return;
            NavigationPrevention.ClearReasons();
        }
        await XHR.PerformRequest('api/session', 'DELETE');
        AuthManager.FireEvent('logout');
    }

    /**
     * Dodaje procedurę obsługi zdarzenia
     * @param event Zdarzenie do obsłużenia
     * @param listener Procedura obsługi
     */
    public static AddEventListener(event: EventName, listener: EventListener) {
        if(this.EventListeners[event] === undefined) {
            this.EventListeners[event] = new Set<EventListener>();
        }

        this.EventListeners[event].add(listener);
    }

    /**
     * Usuwa procedurę obsługi zdarzenia
     * @param event Obsługiwane zdarzenie
     * @param listener Procedura do usunięcia
     */
    public static RemoveEventListener(event: EventName, listener: EventListener) {
        this.EventListeners[event]?.delete(listener);
    }

    /**
     * Wywołuje zdarzenie
     * @param event Zdarzenie do wywołania
     */
    protected static FireEvent(event: EventName) {
        this.EventListeners[event]?.forEach((listener) => listener());
    }
}