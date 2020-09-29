import MalformedResponseException from '../exceptions/malformed_response';
import FetchingErrorException from '../exceptions/fetching_error';
import CacheManager, { CacheStorages } from '../cache/cache_manager';
import NetworkErrorException from '../exceptions/network_error';

type XHRResult = {
    Status: number,
    StatusText: string,
    Response: any,
    ContentLocation: string;
};
type ResolveFunction = (value?: XHRResult | PromiseLike<XHRResult> | undefined) => void;
type RejectFunction = (reason?: any) => void;

/**
 * Wykonuje zapytanie pod podany adres URL i zwraca odpowiedź sformatowaną jako JSON
 * @param url URL, do którego należy wysłać zapytanie
 * @param method Metoda zapytania (domyślnie GET)
 * @param request_data Dane przesyłane razem z zapytaniem, zostaną zserializowane jako JSON
 * @param skip_cache Czy pominąć odczyt odpowiedzi z pamięci podręcznej (dotyczy tylko zapytań GET)
 */
export function PerformRequest(url: string, method?: string, request_data?: any, skip_cache: boolean = false) {
    return new Promise<XHRResult>(async (resolve, reject) => {
        method = (method ?? 'GET').toUpperCase();
        let request = new Request(url, { method: method });

        if(method == 'GET' && !skip_cache) {
            let cache = await CacheManager.Open(CacheStorages.Entities);
            let resource = await cache.GetResource(request);
            if(resource !== undefined) {
                try {
                    return resolve({
                        Status: resource.status,
                        StatusText: resource.statusText,
                        Response: JSON.parse(await resource.text()),
                        ContentLocation: resource.headers.get('Content-Location') ?? ''
                    });
                } catch(e) { }
            }
        }

        if(!window.navigator.onLine) {
            console.error('Brak połączenia z internetem');
            return reject(new NetworkErrorException('Brak połączenia z internetem.'));
        }

        if(method != 'GET') {
            let cache = await CacheManager.Open(CacheStorages.Entities);
            await cache.InvalidateUrl(request.url, method == 'DELETE');
        }

        let xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.onreadystatechange = OnReadyStateChange(request, resolve, reject);
        xhr.onerror = () => { reject(new NetworkErrorException('Wystąpił błąd połączenia internetowego.')); };

        // Zserializuj dane żądania
        let serialized_data: (string | null) = null;
        if(request_data !== undefined) {
            serialized_data = JSON.stringify(request_data);
            xhr.setRequestHeader('Content-Type', 'application/json');
        }

        xhr.send(serialized_data);
    });
}

/**
 * Funkcja zajmuje się przetwarzaniem każdej zmiany stanu przez obiekt XMLHttpRequest
 * @param request Obiekt opisujący wykonywane żądanie
 * @param resolve Funkcja, którą należy wywołać, by spełnić Promise
 * @param reject Funkcja, którą należy wywołać, by odrzucić Promise
 */
function OnReadyStateChange(request: Request, resolve: ResolveFunction, reject: RejectFunction) {
    return async function (this: XMLHttpRequest) {
        let xhr = this;
        if(xhr.readyState != 4) return;

        if(xhr.status >= 200 && xhr.status < 300) {
            let parsed_json = {};
            let content_location = xhr.getResponseHeader('Content-Location') ?? '';
            if(xhr.responseText !== '') {
                try {
                    parsed_json = JSON.parse(xhr.responseText);
                } catch(e) {
                    console.error('Odpowiedź serwera zawiera niepoprawny JSON');
                    return reject(new MalformedResponseException('Serwer zwrócił odpowiedź w nieznanym formacie.', {
                        Status: xhr.status,
                        StatusText: xhr.statusText,
                        ResponseText: xhr.responseText
                    }));
                }
            }

            if(request.method.toUpperCase() == 'GET') {
                let cache = await CacheManager.Open(CacheStorages.Entities);
                cache.SaveResponse(request, new Response(xhr.responseText, {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    headers: {
                        'Content-Location': content_location,
                        'X-Expires': xhr.getResponseHeader('X-Expires') ?? ''
                    }
                }));
            }

            return resolve({
                Status: xhr.status,
                StatusText: xhr.statusText,
                Response: parsed_json,
                ContentLocation: content_location
            });
        } else {
            let parsed_json: any = {};
            if(xhr.responseText !== '') {
                try {
                    parsed_json = JSON.parse(xhr.responseText);
                } catch(e) { }
            }

            console.error('Serwer nie mógł zrealizować żądania. Kod odpowiedzi: ' + xhr.status);
            let message = 'Serwer nie był w stanie zrealizować żądania.';

            if('message' in parsed_json) {
                message = parsed_json.message;
            }

            return reject(new FetchingErrorException(message, {
                Status: xhr.status,
                StatusText: xhr.statusText,
                Response: parsed_json
            }));
        }
    };
}