import { getTranslations } from "next-intl/server";

export default async function PrivacyPolicyPage() {
  return (
    <section className="pt-28 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-invert">
        <h1 className="text-3xl font-bold text-white mb-8">
          Polityka Prywatności
        </h1>
        <div className="text-gray-400 space-y-6">
          <p>
            Niniejsza Polityka Prywatności określa zasady przetwarzania danych
            osobowych zbieranych przez sklep internetowy WB InCode Shop
            dostępny pod adresem shop.wb-incode.pl.
          </p>

          <h2 className="text-xl font-semibold text-white">
            1. Administrator danych
          </h2>
          <p>
            Administratorem danych osobowych jest WB InCode z siedzibą w
            Polsce. Kontakt: kontakt@wb-incode.pl
          </p>

          <h2 className="text-xl font-semibold text-white">
            2. Zakres zbieranych danych
          </h2>
          <p>
            Zbieramy wyłącznie adres email podany podczas zakupu szablonu.
            Dane te są niezbędne do realizacji zamówienia i wysłania linku do
            pobrania produktu.
          </p>

          <h2 className="text-xl font-semibold text-white">
            3. Cel przetwarzania
          </h2>
          <ul className="list-disc pl-6">
            <li>Realizacja zamówień i dostarczenie produktów cyfrowych</li>
            <li>Wysyłanie linku do pobrania zakupionego szablonu</li>
            <li>Obsługa reklamacji i zapytań klientów</li>
          </ul>

          <h2 className="text-xl font-semibold text-white">
            4. Pliki cookie
          </h2>
          <p>
            Strona wykorzystuje pliki cookie niezbędne do funkcjonowania
            serwisu oraz analityczne. Użytkownik może zarządzać ustawieniami
            plików cookie w swojej przeglądarce.
          </p>

          <h2 className="text-xl font-semibold text-white">
            5. Prawa użytkownika
          </h2>
          <p>
            Każdy użytkownik ma prawo do dostępu, sprostowania, usunięcia
            swoich danych osobowych oraz prawo do wniesienia sprzeciwu wobec
            przetwarzania. W celu realizacji tych praw prosimy o kontakt na
            adres: kontakt@wb-incode.pl
          </p>
        </div>
      </div>
    </section>
  );
}
