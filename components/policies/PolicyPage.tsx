import Link from "next/link"
import ServiceShell from "@/components/services/ServiceShell"
import type { PublicLocale } from "@/data/public-content"
import { policiesEn } from "@/data/policies/en"
import { policiesId } from "@/data/policies/id"
import { POLICY_EFFECTIVE_DATE, policyCopy, policyDefinitions, policyOperator, policyVersion, type PolicyBlock, type PolicyId } from "@/data/policies/config"

export default function PolicyPage({ locale, policyId }: { locale: PublicLocale; policyId: PolicyId }) {
  const definition = policyDefinitions.find(policy => policy.id === policyId)!
  const content = (locale === "en" ? policiesEn : policiesId)[policyId]
  const t = (key: keyof typeof policyCopy) => policyCopy[key][locale]
  return <ServiceShell locale={locale} paths={definition.paths}>
    <article className="mx-auto max-w-3xl min-w-0 break-words font-longform text-base sm:text-lg leading-relaxed">
      <header className="mb-10">
        <p className="font-display text-sm uppercase tracking-widest text-muted mb-4">{t("group")}</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-6">{definition.title[locale]}</h1>
        <p className="font-interface text-muted mb-3">{t("version")} {policyVersion.version}</p>
        <p className="text-muted mb-6">{POLICY_EFFECTIVE_DATE ? <>{t("effective")}: <time dateTime={POLICY_EFFECTIVE_DATE}>{new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "id-ID", { dateStyle: "long", timeZone: "UTC" }).format(new Date(POLICY_EFFECTIVE_DATE + "T00:00:00Z"))}</time></> : t("pending")}</p>
        <p>{policyOperator.operator} · {t("operator")}</p>
        <p className="text-muted">{policyOperator.domicile}</p>
        <a href={"mailto:" + policyOperator.email} className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-red-bright break-all">{policyOperator.email}</a>
      </header>
      <div className="border-l-2 border-red pl-5 space-y-4 mb-10 text-muted">
        <p>{t("availability")}</p>
        <p>{t("language")}</p>
      </div>
      <nav aria-label={t("group")} className="flex flex-wrap gap-x-5 gap-y-1 border-y border-line py-4 mb-10 font-interface text-base">
        {policyDefinitions.map(policy => <Link key={policy.id} href={policy.paths[locale]} aria-current={policy.id === policyId ? "page" : undefined} className={`inline-flex min-h-11 items-center underline underline-offset-4 ${policy.id === policyId ? "text-soft font-semibold" : "text-muted hover:text-white"}`}>{policy.label[locale]}</Link>)}
      </nav>
      <nav aria-label={t("contents")} className="mb-12">
        <h2 className="font-display text-2xl font-semibold mb-3">{t("contents")}</h2>
        <ol className="list-decimal pl-6 font-interface">
          {content.sections.map(section => <li key={section.id}><a href={"#" + section.id} className="inline-flex min-h-11 items-center py-2 underline underline-offset-4 text-muted hover:text-white">{section.title}</a></li>)}
        </ol>
      </nav>
      <div className="space-y-10">
        {content.sections.map((section, index) => <section key={section.id} id={section.id}>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold leading-tight mb-4">{index + 1}. {section.title}</h2>
          <div className="space-y-4 text-muted">{section.blocks.map((block, blockIndex) => <PolicyBlockContent key={blockIndex} block={block} locale={locale} />)}</div>
        </section>)}
      </div>
    </article>
  </ServiceShell>
}

function PolicyBlockContent({ block, locale }: { block: PolicyBlock; locale: PublicLocale }) {
  if (block.type === "paragraph") return <p><PolicyText text={block.text} locale={locale} /></p>
  if (block.type === "list") {
    const List = block.ordered ? "ol" : "ul"
    return <List className={`${block.ordered ? "list-decimal" : "list-disc"} pl-6 space-y-2`}>{block.items.map((item, index) => <li key={index}><PolicyText text={item} locale={locale} /></li>)}</List>
  }
  return <table className="w-full table-fixed border-collapse text-base font-interface">
    <caption className="sr-only">{locale === "en" ? "Standard service estimates" : "Estimasi standar layanan"}</caption>
    <thead><tr>{block.headers.map(header => <th key={header} scope="col" className="w-1/2 border-b border-line p-3 text-left font-semibold text-soft">{header}</th>)}</tr></thead>
    <tbody>{block.rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => cellIndex === 0
      ? <th key={cellIndex} scope="row" className="border-b border-line p-3 text-left align-top font-normal"><PolicyText text={cell} locale={locale} /></th>
      : <td key={cellIndex} className="border-b border-line p-3 align-top"><PolicyText text={cell} locale={locale} /></td>)}</tr>)}</tbody>
  </table>
}

function PolicyText({ text, locale }: { text: string; locale: PublicLocale }) {
  return text.split(/(\{\{(?:brand|operator|domicile|email|website)\}\})/g).map((part, index) => {
    if (!part.startsWith("{{")) return part
    const key = part.slice(2, -2) as keyof typeof policyOperator
    if (key === "email" || key === "website") return <a key={index} href={key === "email" ? "mailto:" + policyOperator.email : policyOperator.website} className="underline underline-offset-4 hover:text-white break-words">{key === "email" ? policyOperator.email : policyCopy.website[locale]}</a>
    return policyOperator[key]
  })
}
