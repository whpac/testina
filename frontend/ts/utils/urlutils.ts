/**
 * Ucina z adresu URL części: zapytanie i fragment
 * @param url Adres URL
 */
export function StripQueryAndFragment(url: string) {
    let question_pos = url.indexOf('?');
    if(question_pos != -1) return url.substr(0, question_pos);

    let hash_pos = url.indexOf('#');
    if(hash_pos != -1) return url.substr(0, hash_pos);

    return url;
}