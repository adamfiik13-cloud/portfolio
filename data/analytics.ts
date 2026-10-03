import { catalogPaths, catalogServices, servicePath } from "@/data/service-catalog"
import { policyDefinitions } from "@/data/policies/config"
import type { PublicPage } from "@/lib/analytics/rules"

// Static, approved public content only. Unknown and future routes fail closed.
export const analyticsPages: PublicPage[] = (["en", "id"] as const).flatMap(locale => [
  { page_path: locale === "en" ? "/" : "/id", page_title: "Adam’s Work", locale, content_type: "home" as const, content_category: "studio" },
  { page_path: catalogPaths[locale], page_title: locale === "en" ? "Services | Adam’s Work" : "Layanan | Adam’s Work", locale, content_type: "catalog" as const, content_category: "services" },
  ...catalogServices.map(service => ({ page_path: servicePath(service, locale), page_title: service.name[locale] + " | Adam’s Work", locale, content_type: "service" as const, content_category: service.category })),
  ...policyDefinitions.map(policy => ({ page_path: policy.paths[locale], page_title: policy.title[locale] + " | Adam’s Work", locale, content_type: "policy" as const, content_category: policy.id })),
])

export const analyticsCopy = {
  title: { en: "Optional analytics", id: "Analitik opsional" },
  description: { en: "With your permission, optional analytics helps us understand public-site usage and improve our website and services. It is not required to use this website.", id: "Dengan persetujuan Anda, analitik opsional membantu kami memahami penggunaan halaman publik serta meningkatkan website dan layanan. Analitik tidak diperlukan untuk menggunakan website ini." },
  accept: { en: "Accept analytics", id: "Terima analitik" },
  reject: { en: "Reject non-essential", id: "Tolak yang tidak wajib" },
  settings: { en: "Cookie settings", id: "Pengaturan cookie" },
  privacy: { en: "Privacy Policy", id: "Kebijakan Privasi" },
  close: { en: "Close settings", id: "Tutup pengaturan" },
  unavailable: { en: "Your browser could not save this preference. Analytics stays off; you can try again in Cookie settings.", id: "Browser tidak dapat menyimpan pilihan ini. Analitik tetap nonaktif; Anda dapat mencoba lagi melalui Pengaturan cookie." },
} as const
