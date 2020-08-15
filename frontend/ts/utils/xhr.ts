import MalformedResponseException from '../exceptions/malformed_response';
import FetchingErrorException from '../exceptions/fetching_error';

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
export function Request(url: string, method?: string, request_data?: any) {
    return new Promise<XHRResult>((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(method ?? 'GET', url, true);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.onreadystatechange = OnReadyStateChange(resolve, reject);

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
 * @param resolve Funkcja, którą należy wywołać, by spełnić Promise
 * @param reject Funkcja, którą należy wywołać, by odrzucić Promise
 */
function OnReadyStateChange(resolve: ResolveFunction, reject: RejectFunction) {
    return function (this: XMLHttpRequest) {
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
                    reject(new MalformedResponseException('Serwer zwrócił odpowiedź w nieznanym formacie.', {
                        Status: xhr.status,
                        StatusText: xhr.statusText,
                        ResponseText: xhr.responseText
                    }));
                }
            }

            resolve({
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
            reject(new FetchingErrorException('Serwer nie był w stanie zrealizować żądania.', {
                Status: xhr.status,
                StatusText: xhr.statusText,
                Response: parsed_json
            }));
        }
    };
}