import services from "./services.json"

// Stable service IDs remain independent of page URLs and translated labels.
export const publicContent = {
  id: { serviceDescriptions: {
  "website": "Website dan landing page yang membantu pengunjung memahami bisnis dan mengambil langkah berikutnya.",
  "seo": "Fondasi teknis dan konten agar bisnis lebih mudah ditemukan melalui pencarian.",
  "analytics": "Pengukuran perilaku pengunjung untuk mendukung keputusan bisnis.",
  "consultation": "Prioritas pemasaran yang jelas dan bisa dikerjakan bersama.",
  "meta-ads": "Strategi audiens, pengujian materi kreatif, dan optimasi kampanye.",
  "google-ads": "Menjangkau calon pelanggan melalui pencarian yang relevan."
} },
  en: { serviceDescriptions: Object.fromEntries(services.map(service => [service.id, service.description])) },
} as const

export type PublicLocale = keyof typeof publicContent
export const serviceOrder = ["website", "seo", "analytics", "consultation", "meta-ads", "google-ads"]
export function getPublicServices(locale: PublicLocale) {
  const descriptions: Record<string, string> = publicContent[locale].serviceDescriptions
  return [...services].sort((a, b) => serviceOrder.indexOf(a.id) - serviceOrder.indexOf(b.id))
    .map(service => ({ ...service, description: descriptions[service.id] ?? service.description }))
}
