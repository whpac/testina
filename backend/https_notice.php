<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Testina</title>

        <meta name="theme-color" content="#ffffff">
        <link rel="icon" href="images/logo/testina.svg">
        <link rel="apple-touch-icon" href="images/logo/testina-180.png">
        <link rel="manifest" href="json/manifest.json">

        <style>
            body {font-family:sans-serif; font-size:16px; width:800px; margin:50px auto;}
            p {text-align: justify;}
            .button {display:inline-block; padding:8px 16px; border:1px solid #aaa; border-radius:6px;
                    color:inherit; text-decoration:none;}
            .button:hover {background:#eee}

            @media only screen and (max-width:800px) {
                body {width:auto; margin:50px 10px;}
            }
        </style>
    </head>
    <body>
        <h1>Testina</h1>
        <p>
            Naciśnij poniższy przycisk, aby przejść do Testiny.
        </p>
        <p>
            Możliwe, że przeglądarka wyświetli informację, że strona jest niebezpieczna.
            Wynika to z nie całkiem prawidłowej konfiguracji serwera, ale mimo wszystko połączenie
            jest bezpieczne i szyfrowane. Aby wyświetlić stronę należy klinkąć przycisk „Zaawansowane”,
            znajdujący się pod ostrzeżeniem, a następnie link „Przejdź do strony... (niebezpiecznej)”
            lub „Akceptuję ryzyko” (treść zależy od przeglądarki).
        </p>
        <a href="?redir" class="button">Przejdź do Testiny</a>
        <label><input type="checkbox" id="dont-show" /> Nie pokazuj więcej</label>
        <script>
            if(localStorage.getItem('skip') === 'true'){
                window.location.href = '?redir';
            }
            document.getElementById('dont-show').addEventListener('change', toggleSkip);

            function toggleSkip(elem){
                localStorage.setItem('skip', this.checked ? 'true' : 'false');
            }
        </script>
    </body>
</html>