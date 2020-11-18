:: Skrypt, który służy do przygotowania wersji wdrożeniowej Testiny
:: Wymaga podania nazwy konfiguracji (używanej do ustawienia odpowiednich stałych)

@echo off
setlocal EnableDelayedExpansion
echo == Preparing Testina for deployment ==

if "%~1"=="" goto NO_PRESET
set preset_name=%~1

:: Lista plików, które muszą się znaleźć w konfiguracji
set req_files[0]=dist-presets\%preset_name%\config.php
set req_files[1]=dist-presets\%preset_name%\credentials.php
set req_files[2]=dist-presets\%preset_name%\.htaccess
set req_files[3]=dist-presets\%preset_name%\config.ts

:: Sprawdzenie, czy pliki są obecne
echo Checking for required files...
for /l %%n in (0,1,3) do (
    echo *   !req_files[%%n]!
    if not exist !req_files[%%n]! goto PRESET_MISSING_FILES
)

:: Usunięcie katalogu z wersją wdrożeniową
echo Cleaning previous distribution
rmdir dist /s /q
mkdir dist
mkdir dist\backend
mkdir dist\frontend

:: Kopiowanie .htaccess
echo Copying .htaccess
copy /Y dist-presets\%preset_name%\.htaccess dist\.htaccess 1>NUL 2>NUL

:: Kopiuje backend do folderu dla wersji wdrożeniowej
echo Copying backend into the distribution...
xcopy backend dist\backend /E /H /C /R /Q /Y 1>NUL 2>NUL
copy /Y dist-presets\%preset_name%\config.php dist\backend\config.php 1>NUL 2>NUL
copy /Y dist-presets\%preset_name%\credentials.php dist\backend\credentials.php 1>NUL 2>NUL
:: Usuń obrazki z folderu question_images
rmdir dist\backend\question_images /s /q
mkdir dist\backend\question_images
echo Backend copied.

:: Skopiować strukturę plików dla frontendu (ale tylko statyczne pliki)
echo Copying static frontend files into distribution...
mkdir dist\frontend\fonts
mkdir dist\frontend\images
mkdir dist\frontend\json
xcopy frontend\fonts dist\frontend\fonts /E /H /C /R /Q /Y 1>NUL 2>NUL
xcopy frontend\images dist\frontend\images /E /H /C /R /Q /Y 1>NUL 2>NUL
xcopy frontend\json dist\frontend\json /E /H /C /R /Q /Y 1>NUL 2>NUL

:: Skompilować pliki TypeScript
echo Compiling TypeScript files...
copy /Y frontend\ts\config.ts config.temp.ts 1>NUL 2>NUL
copy /Y dist-presets\%preset_name%\config.ts frontend\ts\config.ts 1>NUL 2>NUL
mkdir dist\frontend\js
call npx webpack 1>NUL 2>NUL
copy /Y config.temp.ts frontend\ts\config.ts 1>NUL 2>NUL
del /F config.temp.ts 1>NUL 2>NUL

:: Skompilować pliki SCSS
echo Compiling SCSS files...
mkdir dist\frontend\css
call sass frontend\scss:dist\frontend\css --style compressed --no-source-map
echo Frontend ready.

goto DONE

:: Komunikat błędu, gdy nie podano konfiguracji
:NO_PRESET
echo Expected: preset name as first argument. Got: nothing.
echo Syntax: deploy (preset_name)
goto DONE

:: Komunikat błędu, gdy brakuje plików
:PRESET_MISSING_FILES
echo The specified preset %preset_name% doesn't contain all required files.
echo Required files:
echo config.php         credentials.php
echo config.ts          .htaccess
goto DONE

:DONE