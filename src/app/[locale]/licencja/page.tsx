export default function LicencjaPage() {
  return (
    <section className="pt-28 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-invert">
        <h1 className="text-3xl font-bold text-white mb-8">Licencja na Produkty Cyfrowe</h1>
        <div className="text-gray-400 space-y-6">

          <h2 className="text-xl font-semibold text-white">1. Postanowienia ogólne</h2>
          <p>Niniejsza Licencja określa zasady korzystania z produktów cyfrowych zakupionych w sklepie internetowym shop.wb-incode.pl, prowadzonym przez WB Partners Sp. z o.o. z siedzibą w Rzeszowie.</p>
          <p>Zakup produktu cyfrowego oznacza udzielenie Licencji na korzystanie z danego pliku, szablonu, kodu źródłowego, dokumentacji lub innego elementu cyfrowego, na warunkach określonych poniżej.</p>
          <p>Licencja zostaje udzielona z chwilą udostępnienia Klientowi zakupionego produktu cyfrowego (np. poprzez link do pobrania, panel klienta lub wiadomość e-mail).</p>

          <h2 className="text-xl font-semibold text-white">2. Przedmiot licencji</h2>
          <p>Licencja obejmuje konkretny produkt cyfrowy zakupiony przez Klienta, w zakresie i wersji udostępnionej w momencie zakupu.</p>
          <p>Produktem cyfrowym objętym niniejszą Licencją może być w szczególności: szablon strony internetowej (HTML/CSS, WordPress, Next.js itp.), motyw lub wtyczka WordPress, gotowy komponent interfejsu, plik graficzny, skrypt, narzędzie, dokumentacja techniczna lub inna paczka zasobów cyfrowych.</p>

          <h2 className="text-xl font-semibold text-white">3. Rodzaj licencji</h2>
          <p>Licencja ma charakter:</p>
          <ul className="list-disc pl-6">
            <li><strong>niewyłączny</strong> – ten sam produkt może być licencjonowany innym Klientom,</li>
            <li><strong>nieprzenoszalny</strong> – Klient nie może przekazać Licencji osobie trzeciej bez zgody Sprzedawcy,</li>
            <li><strong>bezterminowy</strong> – Licencja nie wygasa, chyba że zostanie cofnięta z powodu naruszenia warunków.</li>
          </ul>
          <p>Wszelkie prawa autorskie do produktu pozostają po stronie Sprzedawcy (lub autora wskazanego w opisie produktu). Zakup produktu nie oznacza przeniesienia praw autorskich.</p>

          <h2 className="text-xl font-semibold text-white">4. Dozwolony zakres użytkowania</h2>
          <p>Klient może:</p>
          <ul className="list-disc pl-6">
            <li>używać zakupionego produktu w jednym własnym projekcie komercyjnym lub niekomercyjnym (chyba że wariant licencji stanowi inaczej),</li>
            <li>modyfikować zakupiony produkt na potrzeby swojego projektu,</li>
            <li>wykorzystywać produkt w projekcie realizowanym na rzecz klienta końcowego (np. strona dla firmy), o ile nie dochodzi do dalszej redystrybucji samego produktu.</li>
          </ul>
          <p>Jeżeli opis produktu przewiduje wariant rozszerzonej licencji (np. &bdquo;Licencja Multi-Site&rdquo;, &bdquo;Licencja Agencyjna&rdquo;), dozwolony zakres użycia może być szerszy i wynika wprost z opisu danego wariantu.</p>

          <h2 className="text-xl font-semibold text-white">5. Czego Licencja nie obejmuje</h2>
          <p>Licencja nie obejmuje:</p>
          <ul className="list-disc pl-6">
            <li>dostępu do przyszłych wersji, aktualizacji ani poprawek, chyba że wyraźnie wskazano inaczej w opisie produktu,</li>
            <li>wsparcia technicznego, instalacji, konfiguracji, hostingu, utrzymania serwera, domeny ani żadnych usług towarzyszących, chyba że są one częścią zakupionej oferty,</li>
            <li>indywidualnych modyfikacji wykonywanych przez Sprzedawcę,</li>
            <li>gwarancji kompatybilności z innymi wtyczkami, motywami, bibliotekami lub środowiskiem technicznym Klienta.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white">6. Zakazane działania</h2>
          <p>Klient nie może:</p>
          <ul className="list-disc pl-6">
            <li>udostępniać, sprzedawać, odsprzedawać, sublicencjonować, wypożyczać ani przekazywać zakupionego produktu osobom trzecim,</li>
            <li>publikować produktu w formie pobieralnej na stronach internetowych, repozytoriach, forach, marketplace&apos;ach, dyskach sieciowych ani w jakikolwiek inny sposób umożliwiający pobranie go przez osoby nieuprawnione,</li>
            <li>wykorzystywać zakupionego produktu do stworzenia konkurencyjnego produktu cyfrowego przeznaczonego do sprzedaży (np. nowego szablonu na bazie zakupionego kodu),</li>
            <li>usuwać informacji o autorze, licencji ani znaków identyfikujących produkt, jeżeli takie zostały umieszczone w plikach źródłowych.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white">7. Modyfikacje</h2>
          <p>Klient może modyfikować pliki produktu na potrzeby własnego projektu.</p>
          <p>Sprzedawca nie odpowiada za skutki modyfikacji wprowadzonych przez Klienta. Wszelkie zmiany w kodzie, strukturze plików lub konfiguracji dokonane przez Klienta są realizowane na jego wyłączną odpowiedzialność.</p>

          <h2 className="text-xl font-semibold text-white">8. Prawa do elementów zewnętrznych</h2>
          <p>Produkt cyfrowy może zawierać elementy pochodzące z bibliotek open-source, zasobów zewnętrznych lub komponentów firm trzecich. Korzystanie z tych elementów regulują ich własne licencje (np. MIT, GPL, Apache 2.0 itp.).</p>
          <p>Sprzedawca nie udziela Licencji na elementy, do których nie posiada praw. Lista użytych komponentów zewnętrznych i ich licencji może być dostępna w dokumentacji produktu lub w plikach źródłowych.</p>

          <h2 className="text-xl font-semibold text-white">9. Wsparcie i aktualizacje</h2>
          <p>O ile w opisie produktu nie wskazano inaczej, zakup produktu cyfrowego nie obejmuje wsparcia technicznego ani przyszłych aktualizacji.</p>
          <p>Jeżeli wsparcie lub aktualizacje są oferowane (np. w ramach wariantu &bdquo;z aktualizacjami&rdquo;), ich zakres i czas obowiązywania wynikają z opisu danej oferty.</p>

          <h2 className="text-xl font-semibold text-white">10. Odpowiedzialność Klienta</h2>
          <p>Klient jest odpowiedzialny za:</p>
          <ul className="list-disc pl-6">
            <li>przechowywanie i zabezpieczenie zakupionych plików (Sprzedawca nie ma obowiązku ponownego udostępnienia produktu po upływie okresu dostępu, chyba że wynika to z opisu oferty),</li>
            <li>zapewnienie odpowiedniego środowiska technicznego do korzystania z produktu (np. serwer, domena, hosting, oprogramowanie),</li>
            <li>przestrzeganie warunków niniejszej Licencji.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white">11. Naruszenie Licencji</h2>
          <p>W przypadku stwierdzenia naruszenia warunków niniejszej Licencji, Sprzedawca zastrzega sobie prawo do:</p>
          <ul className="list-disc pl-6">
            <li>cofnięcia Licencji bez prawa do zwrotu,</li>
            <li>zablokowania dostępu do pobranych produktów,</li>
            <li>dochodzenia roszczeń na drodze prawnej.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
