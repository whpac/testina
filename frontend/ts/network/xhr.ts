import MalformedResponseException from '../exceptions/malformed_response';
import FetchingErrorException from '../exceptions/fetching_error';
import CacheManager, { CacheStorages } from '../cache/cache_manager';
import NetworkErrorException from '../exceptions/network_error';
import XHROptions from './xhr_options';
import JsonDeserializer from './deserializers/json_deserializer';

type XHRResult = {
    Status: number;
    StatusText: string;
    Response: any;
    ContentLocation: string;
    FromCache: boolean;
};
type ResolveFunction = (value: XHRResult | PromiseLike<XHRResult>) => void;
type RejectFunction = (reason?: any) => void;

export default class XHR {

    /**
     * Wykonuje zapytanie pod podany adres URL i zwraca odpowiedź sformatowaną jako JSON
     * @param url URL, do którego należy wysłać zapytanie
     * @param method Metoda zapytania (domyślnie GET)
     * @param options Opcje żądania
     * @param request_data Dane przesyłane razem z zapytaniem, zostaną zserializowane jako JSON
     * @param skip_cache Czy pominąć odczyt odpowiedzi z pamięci podręcznej (dotyczy tylko zapytań GET)
     */
    public static PerformRequest(url: string, options?: XHROptions): Promise<XHRResult>;
    public static PerformRequest(url: string, method?: string, request_data?: any, skip_cache?: boolean): Promise<XHRResult>;
    public static PerformRequest(url: string, method?: string | XHROptions, request_data?: any, skip_cache: boolean = false): Promise<XHRResult> {
        let options: XHROptions = {
            Method: 'GET',
            ResponseDeserializer: new JsonDeserializer(),
            RequestData: undefined,
            SkipCache: false
        };
        if(typeof method == 'string' || method === undefined) {
            options.Method = method;
            options.RequestData = request_data;
            options.SkipCache = skip_cache;
        } else {
            options = Object.assign(options, method);
        }

        return new Promise<XHRResult>(async (resolve, reject) => {
            options.Method = (options.Method ?? 'GET').toUpperCase();

            let headers = new Headers();
            headers.append('Accept', options.ResponseDeserializer!.GetAcceptableMimeTypes());
            let request = new Request(url, { method: options.Method, headers: headers });

            if(options.Method == 'GET' && !options.SkipCache) {
                let cache = await CacheManager.Open(CacheStorages.Entities);
                let resource = await cache.GetResource(request);
                if(resource !== undefined) {
                    try {
                        return resolve({
                            Status: resource.status,
                            StatusText: resource.statusText,
                            Response: options.ResponseDeserializer!.Parse(await resource.text()),
                            ContentLocation: resource.headers.get('Content-Location') ?? '',
                            FromCache: true
                        });
                    } catch(e) { }
                }
            }

            if(!window.navigator.onLine) {
                console.error('Brak połączenia z internetem');
                return reject(new NetworkErrorException('Brak połączenia z internetem.'));
            }

            if(options.Method != 'GET') {
                let cache = await CacheManager.Open(CacheStorages.Entities);
                await cache.InvalidateUrl(request.url, options.Method == 'DELETE');
            }

            let xhr = new XMLHttpRequest();
            xhr.open(options.Method, url, true);
            for(let h of headers) {
                xhr.setRequestHeader(h[0], h[1]);
            }
            xhr.onreadystatechange = XHR.OnReadyStateChange(request, resolve, reject, options);
            xhr.onerror = () => { reject(new NetworkErrorException('Wystąpił błąd połączenia internetowego.')); };

            // Zserializuj dane żądania
            let serialized_data: (string | null) = null;
            if(options.RequestData !== undefined) {
                serialized_data = JSON.stringify(options.RequestData);
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
    protected static OnReadyStateChange(request: Request, resolve: ResolveFunction, reject: RejectFunction, options: XHROptions) {
        return async function (this: XMLHttpRequest) {
            let xhr = this;
            if(xhr.readyState != 4) return;

            if(xhr.status >= 200 && xhr.status < 300) {
                let parsed_json = {};
                let content_location = xhr.getResponseHeader('Content-Location') ?? '';
                if(xhr.responseText !== '') {
                    try {
                        parsed_json = options.ResponseDeserializer!.Parse(xhr.responseText);
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
                    ContentLocation: content_location,
                    FromCache: false
                });
            } else {
                let parsed_json: any = {};
                if(xhr.responseText !== '') {
                    try {
                        parsed_json = options.ResponseDeserializer!.Parse(xhr.responseText);
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
}