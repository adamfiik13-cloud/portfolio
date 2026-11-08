import { directPackageRules, type DirectPackage } from "@/data/direct-packages"
import { serviceCategories, type CatalogService } from "@/data/service-catalog"
import { getServiceCopy } from "@/data/service-copy"
import type { PublicLocale } from "@/data/public-content"
import ServiceThumbnail from "./ServiceThumbnail"
import ServiceOrderPanel from "./ServiceOrderPanel"
import { servicePresentation } from "./service-presentation"

export default function ServiceDetailBody({ locale, service, spec }: { locale: PublicLocale; service: CatalogService; spec?: DirectPackage }) {
  const t = getServiceCopy(locale), category = serviceCategories.find(item => item.id === service.category)!
  const presentation = servicePresentation(service.id, locale)
  return <div className="service-detail-grid">
    <header className="service-intro">
      <p className="font-display text-red-bright uppercase text-sm tracking-widest mb-4">{category.name[locale]}</p>
      <h1 className="font-display font-bold text-4xl sm:text-5xl leading-tight mb-5">{service.name[locale]}</h1>
      <p className="font-brand-body text-lg leading-relaxed text-muted">{service.description[locale]}</p>
      <figure className="service-visual"><div className="service-visual-art"><ServiceThumbnail service={service} /></div><figcaption className="space-y-2"><p className="font-display text-lg font-semibold">{t("outputPreview")}</p><p className="text-sm text-muted">{t("illustrationNotice")}</p></figcaption></figure>
    </header>
    <ServiceOrderPanel locale={locale} service={service} spec={spec} />
    <div className="service-content font-longform">
      <Section title={t("outputs")}><Lines items={spec?.outputs[locale] ?? service.outputs[locale]} /></Section>
      <Section title={t("workTools")}>
        <Lines items={spec?.scope[locale] ?? service.scope[locale]} />
        {spec && <div className="mt-5 space-y-3"><h3 className="font-semibold">{t("tools")}</h3><Lines items={spec.tools[locale]} />{spec.technicalConditions[locale].length > 0 && <div className="service-note space-y-3"><h3 className="font-semibold">{t("supportedConditions")}</h3><Lines items={spec.technicalConditions[locale]} /></div>}</div>}
        <div className="mt-6 border-t border-line pt-5 space-y-3"><h3 className="font-semibold">{t("excluded")}</h3><Lines items={spec ? [...spec.exclusions[locale], ...directPackageRules.exclusions[locale], directPackageRules.guarantee[locale]] : [...service.exclusions[locale], t("unlisted")]} /></div>
      </Section>
      <Section title={t("inputs")}>
        {spec ? <><ul className="space-y-4">{spec.briefFields.map(field => <li key={field.id}><h3 className="font-semibold">{field.label[locale]}{!field.required && <span className="font-normal"> — {t("optionalRelevant")}</span>}</h3><p className="text-muted mt-1">{field.instruction[locale]}</p></li>)}</ul><p className="mt-5 service-note">{directPackageRules.ownership[locale]}</p></> : <p>{category.inputs[locale]}</p>}
      </Section>
      <Section title={t("timingAndRevisions")}>
        <dl className="space-y-5"><div><dt className="font-semibold">{t("timeline")}</dt><dd className="mt-1 text-muted">{presentation.duration || t("timingUnknown")}</dd>{spec && <p className="mt-2 text-muted">{directPackageRules.timing[locale]}</p>}</div><div><dt className="font-semibold">{t("revisions")}</dt><dd className="mt-1 text-muted">{presentation.revisions || t("revisionUnknown")}</dd>{spec && <p className="mt-2 text-muted">{directPackageRules.revisions[locale]}</p>}</div></dl>
        <p className="service-note mt-5">{t("workStartSummary")}</p>
      </Section>
      <Section title={t("additionalDetails")}>
        {spec ? <>
          <details><summary className="font-semibold">{t("illustrativeOutput")}</summary><div className="pb-5"><Lines items={spec.illustrations[locale]} /></div></details>
          <details><summary className="font-semibold">{t("fullCosts")}</summary><p className="pb-5">{directPackageRules.costs[locale]}</p></details>
        </> : <>
          <details><summary className="font-semibold">{t("who")}</summary><p className="pb-5">{category.audience[locale]}</p><p className="pb-5">{category.problem[locale]}</p></details>
          <details><summary className="font-semibold">{t("process")}</summary><ol className="list-decimal pl-5 pb-5 space-y-3">{t("steps").map(step => <li key={step}>{step}</li>)}</ol></details>
          {[[t("faqPrice"), t("faqPriceAnswer")], [t("faqStart"), t("inquiryNote")], [t("faqExtra"), t("faqExtraAnswer")]].map(([question, answer]) => <details key={question}><summary className="font-semibold">{question}</summary><p className="pb-5">{answer}</p></details>)}
        </>}
      </Section>
    </div>
  </div>
}
function Lines({ items }: { items: string[] }) { return <ul className="list-disc pl-5 space-y-3 text-muted">{items.map((item, index) => <li key={index}>{item}</li>)}</ul> }
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="service-section"><h2>{title}</h2>{children}</section> }
