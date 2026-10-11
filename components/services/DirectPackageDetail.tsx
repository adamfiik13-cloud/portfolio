import Button from "@/components/ui/Button"
import { directPackageRules, type DirectPackage } from "@/data/direct-packages"
import { serviceInquiry, servicePrice, type CatalogService } from "@/data/service-catalog"
import { getServiceCopy } from "@/data/service-copy"
import { commercePaths } from "@/data/commerce"
import type { PublicLocale } from "@/data/public-content"

export default function DirectPackageDetail({ service, spec, locale }: { service: CatalogService; spec: DirectPackage; locale: PublicLocale }) {
  const t = getServiceCopy(locale)
  return <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-12 lg:gap-20">
    <div className="min-w-0 break-words">
      <header className="mb-12">
        <p className="font-display text-red-bright uppercase text-sm tracking-widest mb-4">{t("approvedPackage")}</p>
        <h1 className="font-display font-bold text-4xl sm:text-5xl leading-tight mb-6">{service.name[locale]}</h1>
        <p className="text-muted text-lg leading-relaxed">{service.description[locale]}</p>
      </header>
      <div className="space-y-9 font-longform">
        <Section title={t("outputs")}><Lines items={spec.outputs[locale]} /></Section>
        <Section title={t("workTools")}>
          <Lines items={spec.scope[locale]} />
          <p className="mt-4 font-semibold text-soft">{t("tools")}</p><Lines items={spec.tools[locale]} />
          {spec.technicalConditions[locale].length > 0 && <div className="mt-4"><p className="font-semibold text-soft">{t("supportedConditions")}</p><Lines items={spec.technicalConditions[locale]} /></div>}
        </Section>
        <Section title={t("illustrativeOutput")}><Lines items={spec.illustrations[locale]} /></Section>
        <Section title={t("inputs")}>
          <ul className="space-y-4">{spec.briefFields.map(item => <li key={item.id}><p className="font-semibold text-soft">{item.label[locale]}{!item.required && <span className="font-normal"> — {t("optionalRelevant")}</span>}</p><p>{item.instruction[locale]}</p></li>)}</ul>
          <p className="mt-4">{directPackageRules.ownership[locale]}</p>
        </Section>
        <Section title={t("excluded")}><Lines items={[...spec.exclusions[locale], ...directPackageRules.exclusions[locale], directPackageRules.guarantee[locale]]} /></Section>
        <Section title={t("timeline")}><p>{spec.duration[locale]}</p><p className="mt-3">{directPackageRules.timing[locale]}</p>{spec.schedulingNote && <p className="mt-3">{spec.schedulingNote[locale]}</p>}</Section>
        <Section title={t("revisions")}><p>{spec.revisions[locale]}</p><p className="mt-3">{directPackageRules.revisions[locale]}</p></Section>
        <Section title={t("nextSteps")}><p>{directPackageRules.workStart[locale]}</p><p className="mt-3">{directPackageRules.outputLanguage[locale]}</p></Section>
      </div>
    </div>
    <aside className="lg:sticky lg:top-24 self-start rounded-2xl border border-line bg-surface p-6 sm:p-8 font-interface">
      <p className="text-sm text-muted mb-3">{t("packageTotal")}</p>
      <p className="font-display text-3xl font-bold mb-5">{servicePrice(service, locale)}</p>
      <p className="text-sm text-muted leading-relaxed mb-6">{directPackageRules.costs[locale]}</p>
      {process.env.APP_ENV === "staging" ? <form action={commercePaths.checkout[locale]} method="get" className="space-y-4">
        <input type="hidden" name="service" value={service.id} />
        <label className="block text-sm" htmlFor="package-output-language">{t("outputLanguage")}</label>
        <select id="package-output-language" name="output" defaultValue={locale} className="w-full min-h-11 bg-black border border-line rounded-lg px-3 py-2 text-soft">
          <option value="en">English</option><option value="id">{locale === "en" ? "Indonesian" : "Indonesia"}</option>
        </select>
        <p className="text-sm text-muted leading-relaxed">{directPackageRules.outputLanguage[locale]}</p>
        <button type="submit" className="w-full min-h-11 px-5 py-3 rounded-xl bg-red hover:bg-red-bright text-white font-display font-semibold">{t(spec.compatibilityApproval ? "requestCompatibility" : "reviewPackageOrder")}</button>
        <p className="text-sm text-muted leading-relaxed">{t("reviewBeforePayment")}</p>
      </form> : <Button href={serviceInquiry(service, locale)} target="_blank" rel="noopener noreferrer" className="w-full">{t(service.inquiry)}</Button>}
      <a href={serviceInquiry(service, locale)} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-center text-sm underline underline-offset-4 mt-4">{t("outsidePackage")}</a>
      {spec.schedulingNote && <p className="mt-4 text-sm text-muted leading-relaxed">{spec.schedulingNote[locale]}</p>}
    </aside>
  </div>
}
function Lines({ items }: { items: string[] }) { return <ul className="list-disc pl-5 space-y-2">{items.map(item => <li key={item}>{item}</li>)}</ul> }
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section><h2 className="font-display font-semibold text-2xl mb-3 text-soft">{title}</h2><div className="text-muted leading-relaxed">{children}</div></section> }
