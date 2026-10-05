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
  title: { en: "Help us improve Adam’s Work", id: "Bantu kami meningkatkan Adam’s Work" },
  description: { en: "We use optional analytics to understand how visitors use the website. Analytics only starts if you accept. You can change your choice at any time.", id: "Kami menggunakan analytics opsional untuk memahami penggunaan website. Analytics hanya aktif jika Anda menyetujuinya. Pilihan dapat diubah kapan saja." },
  accept: { en: "Accept analytics", id: "Izinkan analytics" },
  reject: { en: "Continue without analytics", id: "Lanjut tanpa analytics" },
  settings: { en: "Cookie settings", id: "Pengaturan cookie" },
  privacy: { en: "Privacy Policy", id: "Kebijakan Privasi" },
  close: { en: "Close settings", id: "Tutup pengaturan" },
  unavailable: { en: "Your browser could not save this preference. Analytics stays off; you can try again in Cookie settings.", id: "Browser tidak dapat menyimpan pilihan ini. Analitik tetap nonaktif; Anda dapat mencoba lagi melalui Pengaturan cookie." },
} as const
