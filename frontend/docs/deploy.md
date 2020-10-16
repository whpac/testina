# Sposób wdrożenia Testiny

1. Zmiana ustawień kodu serwerowego (`config.php` i `credentials.php`):
    * Zapisać dane do logowania do bazy danych,
    * Zapisać identyfikator i hasło aplikacji do Office 365,
    * Ustawić katalog bazowy,
    * Wymusić HTTPS,
    * Ustawić link powrotny z logowania Office 365.

2. Ustawić katalog bazowy w `.htaccess`.

3. Zmiana ustawień kodu klienckiego (`config.ts`):
    * Wyłączyć opcję DEBUG (która zmienia wygląd wersji testowej),
    * Ustawić adresy powrotu logowania i wylogowywania Office.

4. Usunąć klasę `.todo` z arkusza stylów `style.scss`.

5. Skompilować pliki TypeScript i SCSS:
    * Wyczyścić katalog `/frontend/js`,
    * Pliki SCSS są kompilowane plikiem wsadowym `scss.bat`,
    * Pliki TypeScript są kompilowane poleceniem `npx webpack`.

6. Usunąć niepotrzebne pliki i foldery:
    * `/node_modules/`,
    * `/package-lock.json`,
    * `/scss.bat`,
    * `/tsconfig.json`,
    * `/webpack.config.js`,
    * `/frontend/docs/`,
    * `/frontend/scss/`,
    * `/frontend/ts/`.

## Linki powrotne Office:

* Link powrotu z logowania: `host/katalog/office_login`,
* Link powrotu z wylogowywania: `host/katalog/`.