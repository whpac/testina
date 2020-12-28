export default class HelpTopic {

    public constructor(
        public Title: string,
        public Identifier: string,
        public Body: string) {

    }

    public static GetTopics() {
        return [
            new HelpTopic(
                'Czym jest Testina?', 'czym_jest_testina',
                `<p>Testina to aplikacja internetowa, służąca do przeprowadzania testów oraz ankiet przez internet.</p>`
            ),
            new HelpTopic(
                'Jak utworzyć test?', 'jak_utworzyc_test',
                `<p>Wszystkie Twoje testy znajdują się w zakładce „<a href="testy/biblioteka" target="_blank">Biblioteka testów</a>”.</p>
<p>Jeżeli nie utworzyłeś(-aś) jeszcze żadnego testu, zobaczysz informację o tym, że Twoja biblioteka jest pusta. Pod nią znajduje się link, po kliknięciu którego stworzysz swój pierwszy test.</p>
<p>Jeśli utworzyłeś(-aś) już jakieś testy, przycisk do tworzenia nowych znajdzie się na górze listy.</p>`
            ),
            new HelpTopic(
                'Jak edytować test?', 'jak_edytowac_test',
                `<p>Otwórz bibliotekę testów i znajdź na liście test, który chcesz edytować. Po prawej stronie wiersza zlokalizowany jest przycisk „Edytuj” (jeśli korzystasz ze strony na telefonie, najpierw naciśnij przycisk z trzema kropkami, a następnie „Edytuj”).</p>
<p>Okno edycji testu jest podzielone na dwie części – listę pytań (na górze) oraz ustawienia testu (na dole). </p>
<p>Dolna sekcja pozwala na zmianę nazwy testu i dostosowanie kilku opcji. Co ważne, po edycji wartości w tej sekcji trzeba nacisnąć przycisk „Zapisz ustawienia”, zlokalizowany u dołu.</p>
<p>Górna część zawiera wszystkie pytania, należące do testu. Aby edytować dowolne z nich, naciśnij przycisk „Edytuj” po prawej stronie odpowiedniego wiersza. Ze względu na to, że podczas rozwiązywania pytania są pokazywane w losowej kolejności, edytor testów nie pozwala nie przemieszczanie ich w górę ani w dół.</p>`
            ),
            new HelpTopic(
                'Mnożnik pytań', 'mnoznik_pytan',
                `<p>Mnożnik pytań określa, ile razy każde pytanie pojawi się w czasie rozwiązywania testu. Domyślnie przyjmuje wartość równą 1, co oznacza, że żadne z pytań się nie powtórzy. Jeśli ustawisz tę wartość na 2, osoba rozwiązująca każde pytanie zobaczy dwukrotnie.</p>
<p>Mnożnik pytań może także przyjmować wartości ułamkowe. Na przykład, jeśli w teście jest 10 pytań, a ten parametr ma wartość 0,5, to rozwiązujący zobaczy losowo wybrane 5 z 10 pytań. Podobnie, przy wartości 1,5, wyświetlonych zostanie 15 pytań, z których każde powtórzy się nie więcej niż dwa razy, ale może też nie zostać wcale wyświetlone.</p>
<p>Liczba pytań, które zostaną wyświetlone jest obliczana w następujący sposób: (liczba pytań) × (wartość mnożnika pytań) i zaokrąglana do najbliższej liczby całkowitej.</p>`
            ),
            new HelpTopic(
                'Limit czasu na podejście', 'limit_czasu_na_podejscie',
                `<p>Ustawienie limitu czasu określa, jak długo rozwiązujący może wypełniać test w konkretnym podejściu. Nie ma jednak wpływu na to, ile razy dana osoba jest w stanie podejść do testu.</p>
<p>Przypisując test konkretnym osobom do wypełnienia możesz ustawić także termin, do kiedy muszą one swoje rozwiązania wysłać.</p>`
            ),
            new HelpTopic(
                'Edycja pytań', 'edycja_pytan',
                `<p>Okienko edycji pytań jest podzielone na dwie części. Górna służy do edycji samego pytania – można tutaj ustawić jego treść, wybrać, jakiego ma być typu, a także dostosować kilka innych opcji (np. ilość punktów przyznawaną za dobrą odpowiedź).</p>
<p>W dolnej części wypisane są warianty odpowiedzi. Można tutaj określić, czy dana opcja jest poprawna, czy też nie. Jeśli aktualnie edytowane jest pytanie otwarte, wtedy każda odpowiedź z listy będzie traktowana jako poprawna.</p>
<p>Wszelkie zmiany, których dokonałeś(-aś) w oknie edycji pytania są zapisywane dopiero wtedy, kiedy klikniesz przycisk „Zapisz”, znajdujący się u dołu.</p>`
            ),
            new HelpTopic(
                'Rodzaje pytań', 'rodzaje_pytan',
                `<p>W tej chwili Testina obsługuje trzy rodzaje pytań.</p><ul>
<li><b>Jednokrotnego wyboru</b> – osoba rozwiązująca może zaznaczyć tylko jeden wariant odpowiedzi spośród proponowanych; tylko jedna może być poprawna</li>
<li><b>Wielokrotnego wyboru</b> – osoba rozwiązująca może zaznaczyć dowolną ilość wariantów odpowiedzi. Co najmniej jedna odpowiedź spośród zaproponowanych musi być poprawna, może być ich więcej (nawet wszystkie mogą być poprawne)</li>
<li><b>Otwarte</b> – osoba rozwiązująca sama musi wpisać odpowiedź na pytanie</li></ul>`
            ),
            new HelpTopic(
                'Liczenie punktów', 'liczenie_punktow',
                `<p>W zależności od rodzaju pytania, sposób liczenia punktów może być nieco inny.</p><ul>
<li>W pytaniach <b>jednokrotnego wyboru</b> punkty otrzymuje się wtedy i tylko wtedy, kiedy zaznaczona zostanie poprawna odpowiedź.</li>
<li>W pytaniach <b>wielokrotnego wyboru</b> autor testu może określić sposób punktowania odpowiedzi:<ul>
    <li><i>zero-jedynkowo</i> – rozwiązujący dostaje punkty wtedy, kiedy (1) zaznaczy wszystkie poprawne odpowiedzi i (2) nie zaznaczy żadnej błędnej;</li>
    <li><i>po ułamku za każdą poprawną odpowiedź</i> – każda poprawna odpowiedź jest warta ułamkowi punktów za pytanie (np. kiedy są dwie poprawne odpowiedzi w pytaniu z 1 punkt, wtedy każda z nich jest warta 0,5 punkta), a każda błędna odpowiedź odejmuje tyle samo punktów (w przykładzie: -0,5 punkta). Rozwiązujący nie może otrzymać za całe pytanie ujemnej liczby punktów.</li></ul></li>
<li>W pytaniach <b>otwartych</b> sprawdzane jest, czy odpowiedź podana przez rozwiązującego zgadza się z którymkolwiek z wariantów ustawionych w edytorze pytań. Dodatkowo, możliwe jest tolerowanie określonej liczby literówek (domyślnie wyłączone).</li></ul>
<p>W ustawieniach testu można zaznaczyć opcję „Pozostaw test do oceny nauczycielowi”. W takiej sytuacji, Testina nie oceni odpowiedzi ucznia. W przypadku testów ocenianych ręcznie pytania otwarte pozwalają na dłuższą odpowiedź (wyświetlane jest większe pole tekstowe).</p>
<p>Niezależnie od wybranego sposobu oceniania, nauczyciel zawsze ma możliwość zmiany wyniku obliczonego przez Testinę. Można to zrobić na stronie z wynikami testu – pod każdym pytaniem znajduje się informacja o liczbie przyznanych punktów i przycisk, służący do zrobienia korekty.</p>`
            ),
            new HelpTopic(
                'Jak liczone są literówki?', 'jak_liczone_sa_literowki',
                `<p>Ilość literówek jest obliczana jako <a href="https://pl.wikipedia.org/wiki/Odleg%C5%82o%C5%9B%C4%87_Levenshteina" target="_blank">odległość Levenshteina</a> między tekstem wpisanym przez rozwiązującego, a poprawną odpowiedzią. Jeżeli odległość ta jest mniejsza lub równa dopuszczalnej liczbie literówek dla przynajmniej jednego wariantu odpowiedzi, rozwiązujący dostaje komplet punktów za pytanie.</p>
<p>Jak działa ten algorytm Levenshteina? Są trzy rodzaje literówek:</p><ul>
<li>zmiana jednej litery na inną, np. <i>pies</i> → <i>pues</i>,</li>
<li>pominięcie jednej litery, np. <i>pies</i> → <i>pes</i>,</li>
<li>wstawienie dodatkowej litery, np. <i>pies</i> → <i>piues</i>.</li></ul>
<p>Wystąpienie któregokolwiek z nich jest liczone jako jedna literówka.</p>`
            ),
            new HelpTopic(
                'Dołączanie obrazków do pytań', 'dolaczanie_obrazkow_do_pytan',
                `<p>Do każdego pytania w teście można dołączyć obrazki. Robi się to za pomocą przycisku „Wybierz pliki” lub przeciągając obrazy z menedżera plików bezpośrednio do przeglądarki internetowej. Istnieje ograniczenie wielkości pojedynczego obrazka wynoszące 500 kB, natomiast nie ma limitu obrazków, które można dołączyć.</p>
<p>Nie jest możliwe dołączanie do pytań plików innych niż obrazki (np. PDF).</p>`
            ),
            new HelpTopic(
                'Ukrywanie poprawności odpowiedzi przed uczniem', 'ukrywanie_poprawnosci_odpowiedzi',
                `<p>Domyślnie, podczas rozwiązywania testu, uczeń widzi, czy odpowiedzi, które zaznaczył były poprawne. Można to zmienić zaznaczając pole wyboru „Nie pokazuj, które odpowiedzi są poprawne, podczas rozwiązywania” w ustawieniach testu. Nawet jeśli wspomniane pole zostanie zaznaczone, test będzie automatycznie oceniany, a po jego ukończeniu uczeń zobaczy swój wynik (jednak bez wyników za poszczególne pytania).</p>`
            ),
            new HelpTopic(
                'Przypisywanie testu', 'przypisywanie_testu',
                `<p>Kiedy masz już gotowy test, możesz przypisać go innym osobom. W tym celu udaj się do <a href="testy/biblioteka" target="_blank">Biblioteki testów</a> i kliknij przycisk „Przypisz” obok odpowiedniego testu (jeśli korzystasz z telefonu, najpierw naciścij trzy kropki, a dopiero potem „Przypisz”). Zobaczysz okienko z listą osób i grup.</p>
<p>Wybierz osoby i/lub grupy, którym chcesz przypisać wybrany test. Jeśli będziesz miał(a) problem ze znalezieniem konkretnych użytkowników, skorzystaj z pola wyszukiwania. Kiedy zaznaczysz wszystkie osoby, które powinny otrzymać test do rozwiązania, kliknij przycisk „Dalej” u dołu okienka.</p>
<p>Na następnej stronie zobaczysz pola, w których można wybrać, do kiedy użytkownicy będą musieli wysłać swoje rozwiązania oraz, ile podejść każdy z nich będzie mógł wykonać. Na koniec należy kliknąć „Zapisz”, by udostępnić test wybranym wcześniej osobom.</p>`
            ),
            new HelpTopic(
                'Jak sprawdzić, komu przypisałem(-am) test?', 'komu_przypisalem_test',
                `<p>W tym celu przejdź do <a href="testy/biblioteka" target="_blank">Biblioteki testów</a>. Obok wybranego testu kliknij przycisk z trzema kropkami. W trzecim wierszu będzie się znajdowała informacja o tym, ile razy go przypisano. Jeśli co najmniej raz, to po kliknięciu na liczbę, zostaniesz przeniesiony(-a) do listy wszystkich przypisań.</p>
<p>Będąc na stronie z listą przypisać możesz udostępnić test dodatkowym osobom lub wyłączyć wybrane osoby z grupy uprawnionych do rozwiązania testu. W tym celu naciśnij przycisk „Edytuj” (na telefonach ma ikonkę ołówka).</p>
<p>Możesz też sprawdzić wyniki poszczególnych osób – w tym celu naciśnij przycisk „Wyniki”. Ukaże Ci się wtedy lista wszystkich osób razem z ich wynikiem (średnim lub najlepszym – zależy od wyboru przy tworzeniu testu). Widoczna będzie także data ostatniego podejścia oraz liczba podejść.</p>`
            ),
            new HelpTopic(
                'Jak zobaczyć wyniki uczniów?', 'jak_zobaczyc_wyniki_uczniow',
                `<p>Na liście osób wspomnianej w powyższej odpowiedzi znajdują się średnie lub najlepsze wyniki uczniów. Po kliknięciu na tę liczbę, ukaże się okienko z rezultatami każdego podejścia. Przy wszystkich znajduje się przycisk z trzema kropkami.</p>
<p>Po kliknięciu tych trzech kropek wyświetli się strona z odpowiedziami ucznia na każde pytanie oraz ze wskazaniem, ile punktów za te odpowiedzi przyznano. Każda niepoprawna, a zaznaczona odpowiedź oraz poprawna i niezaznaczona jest wyróżniana na czerwono.</p>`
            ),
            new HelpTopic(
                'Co oznacza komunikat „Czas na rozwiązanie testu może być za krótki”?', 'czas_moze_byc_za_krotki',
                `<p>Jeśli wybierzesz termin na rozwiązanie testu przypadający w ciągu 24 godzin od momentu przypisywania, wyświetli się ostrzeżenie, że użytkownicy mogą nie mieć czasu na rozwiązanie testu w tym terminie. Jeżeli jesteś pewny(-a), że wybrany termin będzie wystarczający, możesz przypisać test pomimo ostrzeżenia.</p>`
            ),
            new HelpTopic(
                'Ankiety', 'ankiety',
                `<p>Testina pozwala także na przeprowadzanie ankiet. Tworzy się je i wypełnia za pośrednictwem podstrony „<a href="ankiety" target="_blank">Ankiety</a>”. Jest ona podzielona na dwie części – w górnej wymienione są te ankiety, które udostępniono Tobie do wypełnienia, natomiast w dolnej – utworzone przez Ciebie.</p>
<p>W ankietach dostępne są cztery rodzaje pytań:</p><ul>
<li>jednokrotnego wyboru – użytkownik może wybrać jedynie jedną spośród proponowanych odpowiedzi,</li>
<li>wielokrotnego wyboru – użytkownik może wybrać dowolną ilość odpowiedzi spośród zaproponowanych (ale co najmniej jedną),</li>
<li>otwarte – to użytkownik musi wpisać swoją odpowiedź,</li>
<li>o liczbę z zakresu – użytkownik wybiera liczbę całkowitą z ustawionego przedziału, np. od 0 do 5.</li></ul>
<p>Ponadto, każde z powyższych pytań obsługuje tzw. specjalne odpowiedzi, czyli „Nie dotyczy” oraz „Inna – jaka?” (tej nie da się włączyć w pytaniach otwartych).</p>`
            ),
            new HelpTopic(
                'Jak utworzyć ankietę?', 'jak_utworzyc_ankiete',
                `<p>Wszystkie Twoje ankiety znajdują się w zakładce „<a href="ankiety" target="_blank">Ankiety</a>”.</p>
<p>Jeżeli nie utworzyłeś(-aś) jeszcze żadnej ankiety, zobaczysz na środku ekranu link, po kliknięciu którego zostanie stworzona Twoja pierwsza ankieta.</p>
<p>Jeśli utworzyłeś(-aś) już jakieś ankiety, przycisk do tworzenia nowych znajdzie się na górze listy tych już stworzonych.</p>`
            ),
            new HelpTopic(
                'Jak zmienić kolejność pytań w ankiecie?', 'jak_zmienic_kolejnosc_pytan_w_ankiecie',
                `<p>Będąc w edytorze ankiet, najedź myszką na nagłówek pytania, które chcesz przenieść (nagłówek to ta część panelu z pytaniem, gdzie podany jest jego numer oraz pole wyboru rodzaju pytania). W tym momencie po prawej stronie powinny pokazać się trzy przyciski – strzałki w górę i dół oraz ikonka kosza na śmieci. Kliknij jedną ze strzałek, aby przesunąć pytanie o jedno do góry lub do dołu.</p>`
            ),
            new HelpTopic(
                'Jak usunąć pytanie w ankiecie?', 'jak_usunac_pytanie_w_ankiecie',
                `<p>Będąc w edytorze ankiet, najedź myszką na nagłówek pytania. Naciśnij ikonkę kosza na śmieci, która pokaże się po prawej stronie. W tym momencie cały panel zmieni swój wygląd (będzie bardziej wyblakły), a oprócz tego treść pytania zostanie przekreślona. To znak, że po kliknięciu „Zapisz”, to pytanie zostanie usunięte. Aby cofnąć usuwanie, najedź myszką na górną część panelu z pytaniem i naciśnij przycisk z niebieską strzałką w kształcie okręgu.</p>`
            ),
            new HelpTopic(
                'Jak zmienić kolejność odpowiedzi w ankiecie?', 'jak_zmienic_kolejnosc_odpowiedzi_w_ankiecie',
                `<p>Będąc w edytorze pytań, najedź myszką na odpowiedź. Po prawej stronie ukażą się trzy przyciski – strzałki w górę i dół oraz ikonka kosza na śmieci. Kliknij jedną ze strzałek, aby przenieść odpowiedź w górę lub w dół.</p>`
            ),
            new HelpTopic(
                'Jak usunąć odpowiedź w ankiecie?', 'jak_usunac_odpowiedz_w_ankiecie',
                `<p>Będąc w edytorze ankiet, najedź myszką na odpowiedź. Po prawej stronie wyświetli się między innymi ikonka kosza na śmieci. Kliknij na nią. Wtedy treść odpowiedzi zostanie przekreślona. To znak, że po zapisaniu ankiety odpowiedź będzie skasowana. Jeśli będziesz chciał ją przywrócić (co jest możliwe jedynie przed zapisaniem zmian), naciśnij przycisk z okrągłą strzałką w lewo, który wyświetli się po najechaniu na odpowiedź.</p>`
            ),
            new HelpTopic(
                'Odpowiedzi specjalne: „Nie dotyczy” i „Inna – jaka?”', 'odpowiedzi_specjalne',
                `<p>Edytując pytanie w ankiecie, możesz zdecydować, czy ma umożliwiać wybranie odpowiedzi takiej jak „Nie dotyczy” lub „Inna – jaka?”. Odpowiednie pola wyboru wyświetlają się na dole listy odpowiedzi, pod przyciskiem „Dodaj odpowiedź”.</p>`
            ),
            new HelpTopic(
                'Jak udostępnić ankietę?', 'jak_udostepnic_ankiete',
                `<p>Udaj się na stronę <a href="ankiety" target="_blank">Ankiety</a> i znajdź ankietę, którą chcesz udostępnić. W odpowiednim wierszu naciśnij przycisk z trzema kropkami. Ukaże się wtedy okienko z informacjami o danej ankiecie.</p>
<p>W sekcji „Udostępnianie” zobaczysz informację o tym, czy i komu udostępniono wybraną ankietę. Jeżeli nie jest jeszcze udostępniona, kliknij link „Udostępnij...”, by przejść do okna udostępniania. Natomiast jeśli jest już udostępniona innym, naciśnij link „Zarządzaj...”.</p>
<p>Ukaże się wtedy okienko podobne do okna przypisywania testu. Możesz w nim wybrać osoby i/lub grupy, którym ankieta będzie udostępniona, a także wygenerować link bezpośredni do strony wypełniania ankiety. Na następnej stronie są dostępne opcje dotyczące terminu wypełnienia i maksymalnej liczby podejść.</p>`
            ),
            new HelpTopic(
                'Jak udostępnić ankietę osobom, które nie mają konta w Testinie?', 'jak_udostepnic_ankiete_niezalogowanym',
                `<p>Osoby, które nie mają konta w Testinie mogą wypełniać te ankiety, dla których wygenerowano link dostępowy. Aby wygenerować taki link, udaj się do okna udostępniania ankiety i zaznacz opcję „Udostępnij wszystkim, którzy dostaną link” (jeśli jest już zaznaczona, wystarczy, że skopiujesz link wyświetlany pod spodem).</p>
<p>Każda osoba, która dostanie link dostępowy, będzie mogła wypełnić daną ankietę. Należy mieć na uwadze, że nie jest możliwe ścisłe egzekwowanie limitu podejść odnośnie do niezalogowanych osób. W ich przypadku limit będzie obowiązywał osobno w każdej przeglądarce.</p>`
            ),
            new HelpTopic(
                'Jak zobaczyć wyniki ankiety?', 'jak_zobaczyc_wyniki_ankiety',
                `<p>Aby zobaczyć wyniki ankiety, którą utworzyłeś(-aś), przejdź na stronę „Ankiety”, a następnie naciśnij przycisk „Wyniki” w odpowiednim wierszu. Przejdziesz wtedy do strony, gdzie zostaną wyświetlone odpowiedzi użytkowników na każde z pytań. Jeśli zdarzyłoby się, że jakieś pytanie nie jest wyświetlane, oznacza to, że nikt na nie nie odpowiedział.</p>
<p>Do wyników procentowych, pokazywanych przy każdej odpowiedzi, nie są wliczane sytuacje, gdy ktoś nie odpowiedział na dane pytanie (bo na przykład było niewymagane). To oznacza, że jeśli ankietę wypełniło 10 osób, ale tylko 5 odpowiedziało na dane pytanie, wyniki procentowe będą obliczane w odniesieniu do tych 5 respondentów.</p>`
            ),
            new HelpTopic(
                'Dlaczego niektóre zmiany widać dopiero po odświeżeniu strony?', 'pamiec_podreczna',
                `<p>W celu ograniczenia ilości danych przesyłanych między przeglądarką a serwerem, Testina odświeża informacje co około 30 sekund. To oznacza, że w ciągu pół minuty od zmiany np. wyniku ucznia może być wyświetlany ten sprzed zapisu. Kopia podręczna zasobów znajduje się na urządzeniu użytkownika, dlatego wszystkie zmiany są odzwierciedlane w bazie danych na serwerze natychmiastowo po ich zapisaniu.</p>
<p>Kliknięcie przycisku „Odśwież” w przeglądarce wymusi pobranie najbardziej aktualnej wersji wszystkich danych prosto z serwera.</p>`
            )
        ];
    }
}