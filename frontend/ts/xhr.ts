type XHRResult = {
    Status: number,
    StatusText: string,
    Response: any,
    ContentLocation: string
};

/**
 * Wykonuje zapytanie pod podany adres URL i zwraca odpowiedź sformatowaną jako JSON
 * @param url URL, do którego należy wysłać zapytanie
 * @param method Metoda zapytania (domyślnie GET)
 * @param request_data Dane przesyłane razem z zapytaniem, zostaną zserializowane jako JSON
 */
export function Request(url: string, method?: string, request_data?: any){
    return new Promise<XHRResult>((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(method ?? 'GET', url, true);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.onreadystatechange = () => {
            if(xhr.readyState != 4) return;

            if (xhr.status >= 200 && xhr.status < 300){
                let parsed_json = {};
                let content_location = xhr.getResponseHeader('Content-Location') ?? '';
                if(xhr.responseText !== ''){
                    try{
                        parsed_json = JSON.parse(xhr.responseText);
                    }catch(e){
                        console.log('Response contains malformed JSON.');
                        reject({
                            Status: xhr.status,
                            StatusText: xhr.statusText,
                            Response: {},
                            ContentLocation: content_location
                        });
                    }
                }

                resolve({
                    Status: xhr.status,
                    StatusText: xhr.statusText,
                    Response: parsed_json,
                    ContentLocation: content_location
                });
            }else{
                reject({
                    Status: xhr.status,
                    StatusText: xhr.statusText,
                    Response: {},
                    ContentLocation: ''
                });
            }
        };

        // Serialize the request data
        let serialized_data: (string | null) = null;
        if(request_data !== undefined){
            serialized_data = JSON.stringify(request_data);
            xhr.setRequestHeader('Content-Type', 'application/json');
        }

        xhr.send(serialized_data);
    });
}