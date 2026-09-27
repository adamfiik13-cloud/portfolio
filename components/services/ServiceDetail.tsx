import Link from "next/link"
import Button from "@/components/ui/Button"
import { catalogPaths, serviceCategories, serviceInquiry, servicePath, servicePrice, type CatalogService } from "@/data/service-catalog"
import { getServiceCopy } from "@/data/service-copy"
import type { PublicLocale } from "@/data/public-content"
import ServiceShell from "./ServiceShell"

export default function ServiceDetail({ locale, service }: { locale: PublicLocale; service: CatalogService }) {
  const t = getServiceCopy(locale)
  const category = serviceCategories.find(category => category.id === service.category)!
  const paths = { en: servicePath(service, "en"), id: servicePath(service, "id") }
  return <ServiceShell locale={locale} paths={paths}>
    <Link href={catalogPaths[locale]} className="inline-flex items-center min-h-11 text-muted hover:text-white mb-8">← {t("back")}</Link>
    <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-12 lg:gap-20">
      <div>
        <header className="mb-12">
          <p className="font-display text-red-bright uppercase text-sm tracking-widest mb-4">{category.name[locale]}</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl leading-tight mb-6">{service.name[locale]}</h1>
          <p className="text-muted text-lg leading-relaxed">{service.description[locale]}</p>
        </header>
        <div className="space-y-9 font-longform">
          <Section title={t("who")}><p>{category.audience[locale]}</p></Section>
          <Section title={t("problem")}><p>{category.problem[locale]}</p></Section>
          <Section title={t("scope")}><ul className="list-disc pl-5 space-y-2">{service.scope[locale].map(item => <li key={item}>{item}</li>)}</ul></Section>
          <Section title={t("inputs")}><p>{category.inputs[locale]}</p></Section>
          <Section title={t("excluded")}><ul className="list-disc pl-5 space-y-2">{service.exclusions[locale].map(item => <li key={item}>{item}</li>)}<li>{t("unlisted")}</li></ul></Section>
          <Section title={t("timeline")}><p>{service.sessionMinutes ? service.sessionMinutes + " " + t("sessionSuffix") : t("timingUnknown")}</p></Section>
          <Section title={t("revisions")}><p>{service.revisionRounds !== null ? service.revisionRounds + " " + t("revisionSuffix") : t("revisionUnknown")}</p></Section>
          <Section title={t("process")}><ol className="list-decimal pl-5 space-y-2">{t("steps").map(step => <li key={step}>{step}</li>)}</ol></Section>
          <Section title={t("faq")}><div className="divide-y divide-line">{[[t("faqPrice"), t("faqPriceAnswer")], [t("faqStart"), t("faqStartAnswer")], [t("faqExtra"), t("faqExtraAnswer")]].map(([question, answer]) => <details key={question} className="py-3"><summary className="min-h-11 py-3 cursor-pointer text-soft font-semibold">{question}</summary><p className="pb-3">{answer}</p></details>)}</div></Section>
        </div>
      </div>
      <aside className="lg:sticky lg:top-24 self-start rounded-2xl border border-line bg-surface p-6 sm:p-8">
        <p className="font-interface text-sm text-muted mb-3">{t("price")}</p>
        <p className="font-display text-3xl font-bold mb-5">{servicePrice(service, locale)}</p>
        <p className="font-interface text-sm text-muted leading-relaxed mb-6">{t("confirmation")}</p>
        <Button href={serviceInquiry(service, locale)} target="_blank" rel="noopener noreferrer" className="w-full">{t(service.inquiry)}</Button>
        <p className="font-interface text-sm text-muted leading-relaxed mt-4">{t("inquiryNote")}</p>
      </aside>
    </div>
  </ServiceShell>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2 className="font-display font-semibold text-2xl mb-3 text-soft">{title}</h2><div className="text-muted leading-relaxed">{children}</div></section>
}
