import type { PublicLocale } from "@/data/public-content"

export type PolicyId = "terms" | "service" | "refund" | "privacy"
export type PolicyBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
export interface PolicyContent {
  sections: { id: string; title: string; blocks: PolicyBlock[] }[]
}

export const policyOperator = {
  brand: "Adam’s Work",
  operator: "Fikri Adam",
  domicile: "Badung, Bali, Indonesia",
  email: "adamfiik13@gmail.com",
  website: "https://adamswork.app",
} as const

// Set once to the actual production publication date (YYYY-MM-DD) during promotion.
// Staging approval or a build timestamp must never supply this date.
export const POLICY_EFFECTIVE_DATE: string | null = "2026-09-28"
export const policyVersion = { version: "1.0", status: "active" } as const

type Localized = Record<PublicLocale, string>
export const policyDefinitions: { id: PolicyId; paths: Localized; title: Localized; label: Localized; description: Localized }[] = [
  { id: "terms", paths: { en: "/terms", id: "/id/syarat-ketentuan" },
    title: { en: "Terms of Service", id: "Syarat dan Ketentuan Layanan" },
    label: { en: "Terms", id: "Syarat & Ketentuan" },
    description: { en: "Operator identity, service terms, client responsibilities, intellectual property, and dispute information for Adam’s Work.", id: "Identitas operator, ketentuan layanan, tanggung jawab klien, hak kekayaan intelektual, dan informasi sengketa Adam’s Work." } },
  { id: "service", paths: { en: "/service-policy", id: "/id/kebijakan-layanan" },
    title: { en: "Service Policy", id: "Kebijakan Layanan" },
    label: { en: "Service Policy", id: "Kebijakan Layanan" },
    description: { en: "How Adam’s Work handles project commencement, timelines, revisions, review, inactivity, consultations, and handover.", id: "Ketentuan Adam’s Work tentang awal pekerjaan, estimasi waktu, revisi, review, ketidakaktifan, konsultasi, dan serah terima." } },
  { id: "refund", paths: { en: "/refund-policy", id: "/id/kebijakan-refund" },
    title: { en: "Payment, Cancellation & Refund Policy", id: "Kebijakan Pembayaran, Pembatalan, dan Refund" },
    label: { en: "Refund Policy", id: "Kebijakan Refund" },
    description: { en: "Upfront payments, cancellation, progress-based refunds, corrections, and payment disputes for Adam’s Work services.", id: "Ketentuan pembayaran di muka, pembatalan, refund berdasarkan progres, koreksi, dan sengketa pembayaran layanan Adam’s Work." } },
  { id: "privacy", paths: { en: "/privacy", id: "/id/kebijakan-privasi" },
    title: { en: "Privacy Policy", id: "Kebijakan Privasi" },
    label: { en: "Privacy", id: "Kebijakan Privasi" },
    description: { en: "How Adam’s Work handles personal data, service providers, retention, security, cookies, and privacy requests.", id: "Informasi pengelolaan data pribadi, penyedia layanan, penyimpanan, keamanan, cookies, dan permintaan privasi di Adam’s Work." } },
]

export const policyCopy = {
  group: { en: "Policies & legal", id: "Kebijakan & ketentuan" },
  contents: { en: "On this page", id: "Isi halaman" },
  version: { en: "Version", id: "Versi" },
  effective: { en: "Effective date", id: "Tanggal berlaku" },
  pending: { en: "The effective date will be set when this version is published to production.", id: "Tanggal berlaku akan ditetapkan saat versi ini dipublikasikan ke production." },
  availability: { en: "Service inquiries are currently handled through our contact channels. Online accounts, checkout, payment integration, and order acceptance are not yet available. Clauses describing those features apply when they become available; viewing these pages does not create an order or record acceptance.", id: "Saat ini pertanyaan layanan dilayani melalui kanal kontak kami. Akun online, checkout, integrasi pembayaran, dan penerimaan pesanan melalui sistem belum tersedia. Ketentuan terkait fitur tersebut berlaku saat fitur tersedia; melihat halaman ini tidak membuat pesanan atau mencatat persetujuan." },
  language: { en: "Indonesian is the primary contractual version for transactions directed to Indonesian customers. English supports international visitors and transactions, subject to the specific Transaction Terms.", id: "Bahasa Indonesia merupakan versi kontraktual utama untuk transaksi yang ditujukan kepada pelanggan Indonesia. Versi bahasa Inggris mendukung pengunjung dan transaksi internasional, dengan mengikuti Ketentuan Transaksi yang spesifik." },
  operator: { en: "Individual operator trading as Adam’s Work", id: "Operator perorangan dengan nama dagang Adam’s Work" },
  website: { en: "Adam’s Work website", id: "Website Adam’s Work" },
} as const
