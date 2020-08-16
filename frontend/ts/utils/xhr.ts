import MalformedResponseException from '../exceptions/malformed_response';
import FetchingErrorException from '../exceptions/fetching_error';
import CacheManager, { CacheStorages } from '../cache/cache_manager';

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
 */
export function PerformRequest(url: string, method?: string, request_data?: any) {
    return new Promise<XHRResult>(async (resolve, reject) => {
        let request = new Request(url);
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

        let xhr = new XMLHttpRequest();
        xhr.open(method ?? 'GET', url, true);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.onreadystatechange = OnReadyStateChange(request, resolve, reject);

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

            let cache = await CacheManager.Open(CacheStorages.Entities);
            cache.SaveResponse(request, new Response(xhr.responseText, {
                status: xhr.status,
                statusText: xhr.statusText,
                headers: {
                    'Content-Location': content_location,
                    'X-Expires': xhr.getResponseHeader('X-Expires') ?? ''
                }
            }));

            return resolve({
                Status: xhr.status,
                StatusText: xhr.statusText,
                Response: parsed_json,
                ContentLocation: content_location
            });
        } else {
            let parsed_json = {};
            if(xhr.responseText !== '') {
                try {
                    parsed_json = JSON.parse(xhr.responseText);
                } catch(e) { }
            }

            console.error('Serwer nie mógł zrealizować żądania. Kod odpowiedzi: ' + xhr.status);
            return reject(new FetchingErrorException('Serwer nie był w stanie zrealizować żądania.', {
                Status: xhr.status,
                StatusText: xhr.statusText,
                Response: parsed_json
            }));
        }
    };
}