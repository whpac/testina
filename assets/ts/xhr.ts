type XHRResult = {
    Status: number,
    StatusText: string,
    ResponseText: string
};

export function Request(url: string, method?: string){
    return new Promise<XHRResult>((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(method ?? 'GET', url, true);
        xhr.onreadystatechange = () => {
            if(xhr.readyState != 4) return;

            if (xhr.status >= 200 && xhr.status < 300){
                resolve({
                    Status: xhr.status,
                    StatusText: xhr.statusText,
                    ResponseText: xhr.responseText
                });
            }else{
                reject({
                    Status: xhr.status,
                    StatusText: xhr.statusText,
                    ResponseText: ''
                });
            }
        };
        xhr.send();
    });
}