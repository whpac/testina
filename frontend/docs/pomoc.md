# Czym jest Testina?
Testina to aplikacja internetowa, służąca do przeprowadzania testów oraz ankiet przez internet.

# Jak utworzyć test?
Wszystkie Twoje testy znajdują się w zakładce „[Biblioteka testów](testy/biblioteka)”.

Jeżeli nie utworzyłeś(-aś) jeszcze żadnego testu, zobaczysz informację o tym, że Twoja biblioteka jest pusta. Pod nią znajduje się link, po kliknięciu którego stworzysz swój pierwszy test.

Jeśli utworzyłeś(-aś) już jakieś testy, przycisk do tworzenia nowych znajdzie się na górze listy.

# Jak edytować test?
Otwórz bibliotekę testów i znajdź na liście test, który chcesz edytować. Po prawej stronie wiersza zlokalizowany jest przycisk „Edytuj” (jeśli korzystasz ze strony na telefonie, najpierw naciśnij przycisk z trzema kropkami, a następnie „Edytuj”).

Okno edycji testu jest podzielone na dwie części – listę pytań (na górze) oraz ustawienia testu (na dole). 

Dolna sekcja pozwala na zmianę nazwy testu i dostosowanie kilku opcji. Co ważne, po edycji wartości w tej sekcji trzeba nacisnąć przycisk „Zapisz ustawienia”, zlokalizowany u dołu.

Górna część zawiera wszystkie pytania, należące do testu. Aby edytować dowolne z nich, naciśnij przycisk „Edytuj” po prawej stronie odpowiedniego wiersza. Ze względu na to, że podczas rozwiązywania pytania są pokazywane w losowej kolejności, edytor testów nie pozwala nie przemieszczanie ich w górę ani w dół.

# Mnożnik pytań
Mnożnik pytań określa, ile razy każde pytanie pojawi się w czasie rozwiązywania testu. Domyślnie przyjmuje wartość równą 1, co oznacza, że żadne z pytań się nie powtórzy. Jeśli ustawisz tę wartość na 2, osoba rozwiązująca każde pytanie zobaczy dwukrotnie.

Mnożnik pytań może także przyjmować wartości ułamkowe. Na przykład, jeśli w teście jest 10 pytań, a ten parametr ma wartość 0,5, to rozwiązujący zobaczy losowo wybrane 5 z 10 pytań. Podobnie, przy wartości 1,5, wyświetlonych zostanie 15 pytań, z których każde powtórzy się nie więcej niż dwa razy, ale może też nie zostać wcale wyświetlone.

Liczba pytań, które zostaną wyświetlone jest obliczana w następujący sposób: (liczba pytań) × (wartość mnożnika pytań) i zaokrąglana do najbliższej liczby całkowitej.

# Limit czasu na podejście
Ustawienie limitu czasu określa, jak długo rozwiązujący może wypełniać test w konkretnym podejściu. Nie ma jednak wpływu na to, ile razy dana osoba jest w stanie podejść do testu.

Przypisując test konkretnym osobom do wypełnienia możesz ustawić także termin, do kiedy muszą one swoje rozwiązania wysłać.

# Edycja pytań
Okienko edycji pytań jest podzielone na dwie części. Górna służy do edycji samego pytania – można tutaj ustawić jego treść, wybrać, jakiego ma być typu, a także dostosować kilka innych opcji (np. ilość punktów przyznawaną za dobrą odpowiedź).

W dolnej części wypisane są warianty odpowiedzi. Można tutaj określić, czy dana opcja jest poprawna, czy też nie. Jeśli aktualnie edytowane jest pytanie otwarte, wtedy każda odpowiedź z listy będzie traktowana jako poprawna.

Wszelkie zmiany, których dokonałeś(-aś) w oknie edycji pytania są zapisywane dopiero wtedy, kiedy klikniesz przycisk „Zapisz”, znajdujący się u dołu.

# Rodzaje pytań
W tej chwili Testina obsługuje trzy rodzaje pytań.
* **Jednokrotnego wyboru** – osoba rozwiązująca może zaznaczyć tylko jeden wariant odpowiedzi spośród proponowanych; tylko jedna może być poprawna
* **Wielokrotnego wyboru** – osoba rozwiązująca może zaznaczyć dowolną ilość wariantów odpowiedzi. Co najmniej jedna odpowiedź spośród zaproponowanych musi być poprawna, może być ich więcej (nawet wszystkie mogą być poprawne)
* **Otwarte** – osoba rozwiązująca sama musi wpisać odpowiedź na pytanie

# Liczenie punktów
W zależności od rodzaju pytania, sposób liczenia punktów może być nieco inny.
* W pytaniach **jednokrotnego wyboru** punkty otrzymuje się wtedy i tylko wtedy, kiedy zaznaczona zostanie poprawna odpowiedź.
* W pytaniach **wielokrotnego wyboru** autor testu może określić sposób punktowania odpowiedzi:
    * *zero-jedynkowo* – rozwiązujący dostaje punkty wtedy, kiedy (1) zaznaczy wszystkie poprawne odpowiedzi i (2) nie zaznaczy żadnej błędnej;
    * *po ułamku za każdą poprawną odpowiedź* – każda poprawna odpowiedź jest warta ułamkowi punktów za pytanie (np. kiedy są dwie poprawne odpowiedzi w pytaniu z 1 punkt, wtedy każda z nich jest warta 0,5 punkta), a każda błędna odpowiedź odejmuje tyle samo punktów (w przykładzie: -0,5 punkta). Rozwiązujący nie może otrzymać za całe pytanie ujemnej liczby punktów.
* W pytaniach **otwartych** sprawdzane jest, czy odpowiedź podana przez rozwiązującego zgadza się z którymkolwiek z wariantów ustawionych w edytorze pytań. Dodatkowo, możliwe jest tolerowanie określonej liczby literówek (domyślnie wyłączone).

# Jak liczone są literówki?
Ilość literówek jest obliczana jako [odległość Levenshteina](https://pl.wikipedia.org/wiki/Odleg%C5%82o%C5%9B%C4%87_Levenshteina) między tekstem wpisanym przez rozwiązującego, a poprawną odpowiedzią. Jeżeli odległość ta jest mniejsza lub równa dopuszczalnej liczbie literówek dla przynajmniej jednego wariantu odpowiedzi, rozwiązujący dostaje komplet punktów za pytanie.

Jak działa ten algorytm Levenshteina? Są trzy rodzaje literówek:
* zmiana jednej litery na inną, np. *pies* -> *pues*,
* pominięcie jednej litery, np. *pies* -> *pes*,
* wstawienie dodatkowej litery, np. *pies* -> *piues*.

Wystąpienie któregokolwiek z nich jest liczone jako jedna literówka.

# Przypisywanie testu
Kiedy masz już gotowy test, możesz przypisać go innym osobom. W tym celu udaj się do [Biblioteki testów](testy/biblioteka) i kliknij przycisk „Przypisz” obok odpowiedniego testu (jeśli korzystasz z telefonu, najpierw naciścij trzy kropki, a dopiero potem „Przypisz”). Zobaczysz okienko z listą osób i grup.

Wybierz osoby i/lub grupy, którym chcesz przypisać wybrany test. Jeśli będziesz miał(a) problem ze znalezieniem konkretnych użytkowników, skorzystaj z pola wyszukiwania. Kiedy zaznaczysz wszystkie osoby, które powinny otrzymać test do rozwiązania, kliknij przycisk „Dalej” u dołu okienka.

Na następnej stronie zobaczysz pola, w których można wybrać, do kiedy użytkownicy będą musieli wysłać swoje rozwiązania oraz, ile podejść każdy z nich będzie mógł wykonać. Na koniec należy kliknąć „Zapisz”, by udostępnić test wybranym wcześniej osobom.

# Jak sprawdzić, komu przypisałem(-am) test?
W tym celu przejdź do [Biblioteki testów](testy/biblioteka). Obok wybranego testu kliknij przycisk z trzema kropkami. W trzecim wierszu będzie się znajdowała informacja o tym, ile razy go przypisano. Jeśli co najmniej raz, to po kliknięciu na liczbę, zostaniesz przeniesiony(-a) do listy wszystkich przypisań.

Będąc na stronie z listą przypisać możesz udostępnić test dodatkowym osobom lub wyłączyć wybrane osoby z grupy uprawnionych do rozwiązania testu. W tym celu naciśnij przycisk „Edytuj” (na telefonach ma ikonkę ołówka).

Możesz też sprawdzić wyniki poszczególnych osób – w tym celu naciśnij przycisk „Wyniki”. Ukaże Ci się wtedy lista wszystkich osób razem z ich wynikiem (średnim lub najlepszym – zależy od wyboru przy tworzeniu testu). Widoczna będzie także data ostatniego podejścia oraz liczba podejść.

# Co oznacza komunikat „Czas na rozwiązanie testu może być za krótki”?
Jeśli wybierzesz termin na rozwiązanie testu przypadający w ciągu 24 godzin od momentu przypisywania, wyświetli się ostrzeżenie, że użytkownicy mogą nie mieć czasu na rozwiązanie testu w tym terminie. Jeżeli jesteś pewny(-a), że wybrany termin będzie wystarczający, możesz przypisać test pomimo ostrzeżenia.

# Ankiety
# Jak utworzyć ankietę?
# Jak zmienić kolejność pytań?
# Odpowiedzi specjalne: „Nie dotyczy” i „Inna – jaka?”
# Jak udostępnić ankietę?
# Jak udostępnić ankietę osobom, które nie mają konta w Testinie?