import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import ContactForm from "@/components/shop/ContactForm";

export default function KontaktPage() {
  const t = useTranslations("contact");

  return (
    <section className="pt-28 pb-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t("title")}
          </h1>
          <p className="text-gray-400 text-lg max-w-lg mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Form card */}
        <div className="bg-surface border border-white/5 rounded-2xl p-6 sm:p-8">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
