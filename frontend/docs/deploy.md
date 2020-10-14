# Sposób wdrożenia Testiny

1. Dostosować kod do katalogu, w którym znajdzie się aplikacja (w stosunku) do katalogu głównego serwera:
    * Zmienić zawartość tagu `<base href="/">`,
    * Ustawić odpowiedni katalog bazowy w `.htaccess`.

2. Usunąć dyrektywy debugowania:
    * Ustawić `DEBUG` na `false` w `config.ts`,
    * Usunąć klasę `.todo` w `style.scss`.

3. Włączyć wymuszanie HTTPS w `index.php`.

4. Dopasować odwołania do API Office 365:
    * W `config.ts` ustawić adresy powrotu z logowania i wylogowywania Office,
    * W `credentials.php` wpisać identyfikator aplikacji Office 365 i hasło,
    * W `auth/externallogin/tokenmanager.php` ustawić dobry link powrotny w funkcjach: `ExchangeAuthorizationCodeIntoTokens()` i `TryToGetNewAccessToken()`.

5. Integracja z bazą danych:
    * W `credentials.php` zapisać dane logowania do bazy danych.

6. Skompilować pliki TypeScript i SCSS:
    * Pliki SCSS są kompilowane plikiem wsadowym `scss.bat`,
    * Pliki TypeScript są kompilowane poleceniem `npx webpack`.

7. Usunąć niepotrzebne pliki i foldery:
    * `/node_modules/`,
    * `/package-lock.json`,
    * `/scss.bat`,
    * `/tsconfig.json`,
    * `/webpack.config.js`,
    * `/frontend/docs/`,
    * `/frontend/scss/`,
    * `/frontend/ts/`.