import UserLoader from '../entities/loaders/userloader';
import XHR from '../network/xhr';
import NavigationPrevention from '../1page/navigation_prevention';
import { Config } from '../config';

type SessionDescriptor = {
    is_authorized: boolean;
    expire_time: string | null;
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
    private static ExpireDate: Date | null;
    private static LastAuthorizedState: boolean = false;

    /**
     * Sprawdza, czy bieżący użytkownik jest zalogowany
     */
    public static async IsAuthorized(bypass_cache: boolean = false) {
        let result = await XHR.PerformRequest('api/session', undefined, undefined, bypass_cache || !AuthManager.LastAuthorizedState || AuthManager.ExpireDate === null);
        let response = result.Response as SessionDescriptor;

        if(response.expire_time !== null && !result.FromCache) {
            AuthManager.ExpireDate = new Date(response.expire_time);
        } else {
            if(response.expire_time === null) AuthManager.ExpireDate = null;
        }

        if(AuthManager.ExpireDate === null || AuthManager.ExpireDate < new Date()) {
            response.is_authorized = false;
        }

        if(AuthManager.LastAuthorizedState != response.is_authorized) {
            if(response.is_authorized) AuthManager.FireEvent('login');
            else AuthManager.FireEvent('logout');
        }
        AuthManager.LastAuthorizedState = response.is_authorized;

        return response.is_authorized;
    }

    /**
     * Zwraca bieżącego użytkownika
     * @param force Czy załadować bezpośrednio z serwera
     */
    public static async GetCurrentUser(force: boolean = false) {
        return UserLoader.GetCurrent(force);
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
        AuthManager.ExpireDate = null;
        AuthManager.FireEvent('logout');
    }

    public static LogOutOfOffice() {
        window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/logout?
post_logout_redirect_uri=` + encodeURIComponent(Config.OFFICE_LOGOUT_RETURN_ADDRESS);
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