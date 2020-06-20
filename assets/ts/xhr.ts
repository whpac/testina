type XHRResult = {
    Status: number,
    StatusText: string,
    Response: {}
};

/**
 * Performs a request to the server and returns a response parsed as a JSON
 * @param url URL to make a request to
 * @param method Request method (default is GET)
 * @param request_data Object containing the request data, will be serialized as a JSON
 */
export function Request(url: string, method?: string, request_data?: any){
    return new Promise<XHRResult>((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(method ?? 'GET', url, true);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.onreadystatechange = () => {
            if(xhr.readyState != 4) return;

            if (xhr.status >= 200 && xhr.status < 300){
                resolve({
                    Status: xhr.status,
                    StatusText: xhr.statusText,
                    Response: JSON.parse(xhr.responseText)
                });
            }else{
                reject({
                    Status: xhr.status,
                    StatusText: xhr.statusText,
                    Response: {}
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