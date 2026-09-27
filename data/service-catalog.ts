import type { PublicLocale } from "./public-content"
import siteConfig from "./site-config.json"

type Localized<T> = Record<PublicLocale, T>
export type CategoryId = "websites" | "seo" | "tracking" | "ads" | "strategy" | "career"
export interface ServiceCategory { id: CategoryId; name: Localized<string>; description: Localized<string>; audience: Localized<string>; problem: Localized<string>; inputs: Localized<string> }
export interface CatalogService {
  id: string
  slugs: Localized<string>
  category: CategoryId
  price: { currency: "IDR"; amount: number; kind: "fixed" | "starting"; interval: "once" | "month" }
  inquiry: "service" | "quote" | "consultation"
  sessionMinutes: number | null
  revisionRounds: number | null
  name: Localized<string>
  description: Localized<string>
  scope: Localized<string[]>
  exclusions: Localized<string[]>
}

export const serviceCategories: ServiceCategory[] = [
  {
    "id": "websites",
    "name": {
      "en": "Websites",
      "id": "Website"
    },
    "description": {
      "en": "Build a clear digital foundation.",
      "id": "Bangun fondasi digital yang jelas."
    },
    "audience": {
      "en": "Businesses planning a new website or a clearer online presence.",
      "id": "Bisnis yang merencanakan website baru atau kehadiran daring yang lebih jelas."
    },
    "problem": {
      "en": "An unclear website structure or functionality that does not match business needs.",
      "id": "Struktur website yang tidak jelas atau fungsi yang belum sesuai kebutuhan bisnis."
    },
    "inputs": {
      "en": "Business goals, page priorities, available copy, brand assets, and relevant website access.",
      "id": "Tujuan bisnis, prioritas halaman, copy yang tersedia, aset merek, dan akses website yang relevan."
    }
  },
  {
    "id": "seo",
    "name": {
      "en": "SEO",
      "id": "SEO"
    },
    "description": {
      "en": "Make your business easier to find.",
      "id": "Bantu bisnis Anda lebih mudah ditemukan."
    },
    "audience": {
      "en": "Businesses reviewing or improving their organic search foundation.",
      "id": "Bisnis yang meninjau atau memperbaiki fondasi pencarian organik."
    },
    "problem": {
      "en": "Unclear search priorities, technical issues, or gaps in on-page content.",
      "id": "Prioritas pencarian yang belum jelas, masalah teknis, atau kekurangan konten halaman."
    },
    "inputs": {
      "en": "Website URL, business priorities, target audience, and relevant search or website access.",
      "id": "URL website, prioritas bisnis, target audiens, serta akses pencarian atau website yang relevan."
    }
  },
  {
    "id": "tracking",
    "name": {
      "en": "Tracking & Analytics",
      "id": "Tracking & Analytics"
    },
    "description": {
      "en": "Understand what visitors do next.",
      "id": "Pahami tindakan pengunjung berikutnya."
    },
    "audience": {
      "en": "Businesses that need clearer measurement of website or advertising activity.",
      "id": "Bisnis yang membutuhkan pengukuran aktivitas website atau iklan yang lebih jelas."
    },
    "problem": {
      "en": "Missing or unclear event measurement across the relevant platforms.",
      "id": "Pengukuran event yang belum tersedia atau belum jelas pada platform terkait."
    },
    "inputs": {
      "en": "Website details, measurement goals, event priorities, and authorized platform access.",
      "id": "Detail website, tujuan pengukuran, prioritas event, dan akses platform yang berizin."
    }
  },
  {
    "id": "ads",
    "name": {
      "en": "Paid Advertising",
      "id": "Iklan Berbayar"
    },
    "description": {
      "en": "Support a focused acquisition effort.",
      "id": "Dukung upaya akuisisi yang terarah."
    },
    "audience": {
      "en": "Businesses preparing or managing paid advertising campaigns.",
      "id": "Bisnis yang menyiapkan atau mengelola kampanye iklan berbayar."
    },
    "problem": {
      "en": "Campaign setup, testing, or optimization priorities that need a clearer direction.",
      "id": "Prioritas penyiapan, pengujian, atau optimasi kampanye yang membutuhkan arah lebih jelas."
    },
    "inputs": {
      "en": "Campaign goals, target audience, ad budget, available assets, and authorized advertising account access.",
      "id": "Tujuan kampanye, target audiens, anggaran iklan, aset yang tersedia, dan akses akun iklan yang berizin."
    }
  },
  {
    "id": "strategy",
    "name": {
      "en": "Strategy & Marketplace",
      "id": "Strategi & Marketplace"
    },
    "description": {
      "en": "Decide what deserves attention first.",
      "id": "Tentukan hal yang perlu diprioritaskan."
    },
    "audience": {
      "en": "Business owners and teams reviewing digital marketing or marketplace priorities.",
      "id": "Pemilik bisnis dan tim yang meninjau prioritas pemasaran digital atau marketplace."
    },
    "problem": {
      "en": "Unclear priorities, competing ideas, or uncertainty about the next practical step.",
      "id": "Prioritas yang belum jelas, gagasan yang bersaing, atau keraguan mengenai langkah praktis berikutnya."
    },
    "inputs": {
      "en": "Business context, goals, current challenges, and relevant performance information.",
      "id": "Konteks bisnis, tujuan, tantangan saat ini, dan informasi performa yang relevan."
    }
  },
  {
    "id": "career",
    "name": {
      "en": "Career Services",
      "id": "Layanan Karier"
    },
    "description": {
      "en": "Additional support for individual professionals.",
      "id": "Dukungan tambahan untuk profesional individu."
    },
    "audience": {
      "en": "Individual professionals reviewing their career direction or CV.",
      "id": "Profesional individu yang meninjau arah karier atau CV."
    },
    "problem": {
      "en": "Unclear career priorities or a CV that needs review or better structure.",
      "id": "Prioritas karier yang belum jelas atau CV yang perlu ditinjau atau diperbaiki strukturnya."
    },
    "inputs": {
      "en": "Current CV where relevant, career goals, target roles, and questions you want to discuss.",
      "id": "CV saat ini jika relevan, tujuan karier, peran yang dituju, dan pertanyaan yang ingin dibahas."
    }
  }
]

// Approved public offers; price and delivery facts are shared across languages.
export const catalogServices: CatalogService[] = [
  {
    "id": "landing-page-starter",
    "slugs": {
      "en": "landing-page-starter",
      "id": "landing-page-starter"
    },
    "category": "websites",
    "price": {
      "currency": "IDR",
      "amount": 1750000,
      "kind": "fixed",
      "interval": "once"
    },
    "inquiry": "service",
    "sessionMinutes": null,
    "revisionRounds": 2,
    "name": {
      "en": "Landing Page Starter",
      "id": "Landing Page Starter"
    },
    "description": {
      "en": "A focused page to introduce your offer and guide inquiries.",
      "id": "Halaman terarah untuk memperkenalkan penawaran dan mengarahkan pertanyaan."
    },
    "scope": {
      "en": [
        "1 page",
        "Up to 6 sections",
        "Responsive implementation",
        "WhatsApp or inquiry form integration",
        "Basic SEO setup"
      ],
      "id": [
        "1 halaman",
        "Hingga 6 bagian",
        "Implementasi responsif",
        "Integrasi WhatsApp atau formulir pertanyaan",
        "Pengaturan SEO dasar"
      ]
    },
    "exclusions": {
      "en": [
        "Domain, hosting, full copywriting, premium assets, and advanced integrations"
      ],
      "id": [
        "Domain, hosting, copywriting lengkap, aset premium, dan integrasi lanjutan"
      ]
    }
  },
  {
    "id": "business-website",
    "slugs": {
      "en": "business-website",
      "id": "website-bisnis"
    },
    "category": "websites",
    "price": {
      "currency": "IDR",
      "amount": 2750000,
      "kind": "fixed",
      "interval": "once"
    },
    "inquiry": "service",
    "sessionMinutes": null,
    "revisionRounds": 2,
    "name": {
      "en": "Business Website",
      "id": "Website Bisnis"
    },
    "description": {
      "en": "Present your business across a structured website.",
      "id": "Tampilkan bisnis melalui website yang terstruktur."
    },
    "scope": {
      "en": [
        "Up to 5 pages",
        "Responsive implementation",
        "Basic SEO",
        "Basic analytics",
        "Simple CMS only when included in the confirmed scope"
      ],
      "id": [
        "Hingga 5 halaman",
        "Implementasi responsif",
        "SEO dasar",
        "Analytics dasar",
        "CMS sederhana hanya jika termasuk dalam scope yang dikonfirmasi"
      ]
    },
    "exclusions": {
      "en": [
        "Domain, hosting, complete copywriting, premium assets, and custom integrations"
      ],
      "id": [
        "Domain, hosting, copywriting lengkap, aset premium, dan integrasi khusus"
      ]
    }
  },
  {
    "id": "custom-website",
    "slugs": {
      "en": "custom-website",
      "id": "website-kustom"
    },
    "category": "websites",
    "price": {
      "currency": "IDR",
      "amount": 4000000,
      "kind": "starting",
      "interval": "once"
    },
    "inquiry": "quote",
    "sessionMinutes": null,
    "revisionRounds": null,
    "name": {
      "en": "Custom Website",
      "id": "Website Kustom"
    },
    "description": {
      "en": "Define a website around non-standard requirements.",
      "id": "Tentukan website sesuai kebutuhan nonstandar."
    },
    "scope": {
      "en": [
        "Scope discovery for dashboards, authentication, payments, API integrations, custom workflows, or other non-standard functionality",
        "Specific functionality and deliverables are confirmed in the quote"
      ],
      "id": [
        "Penelusuran scope untuk dashboard, autentikasi, pembayaran, integrasi API, alur khusus, atau fungsi nonstandar lainnya",
        "Fungsi dan hasil kerja spesifik dikonfirmasi dalam penawaran"
      ]
    },
    "exclusions": {
      "en": [],
      "id": []
    }
  },
  {
    "id": "seo-audit-roadmap",
    "slugs": {
      "en": "seo-audit-roadmap",
      "id": "audit-seo-roadmap"
    },
    "category": "seo",
    "price": {
      "currency": "IDR",
      "amount": 500000,
      "kind": "fixed",
      "interval": "once"
    },
    "inquiry": "service",
    "sessionMinutes": null,
    "revisionRounds": null,
    "name": {
      "en": "SEO Audit & Roadmap",
      "id": "Audit SEO & Roadmap"
    },
    "description": {
      "en": "Identify search priorities and practical next steps.",
      "id": "Identifikasi prioritas pencarian dan langkah praktis berikutnya."
    },
    "scope": {
      "en": [
        "Technical review",
        "Keyword opportunities",
        "Prioritized findings",
        "Practical action plan"
      ],
      "id": [
        "Tinjauan teknis",
        "Peluang kata kunci",
        "Temuan berprioritas",
        "Rencana tindakan praktis"
      ]
    },
    "exclusions": {
      "en": [],
      "id": []
    }
  },
  {
    "id": "seo-foundation",
    "slugs": {
      "en": "seo-foundation",
      "id": "fondasi-seo"
    },
    "category": "seo",
    "price": {
      "currency": "IDR",
      "amount": 950000,
      "kind": "fixed",
      "interval": "once"
    },
    "inquiry": "service",
    "sessionMinutes": null,
    "revisionRounds": null,
    "name": {
      "en": "SEO Foundation",
      "id": "Fondasi SEO"
    },
    "description": {
      "en": "Address the basic search foundations of priority pages.",
      "id": "Tangani fondasi pencarian dasar pada halaman prioritas."
    },
    "scope": {
      "en": [
        "Audit",
        "Sitemap and robots review/setup",
        "Metadata",
        "Basic improvements for up to 5 pages"
      ],
      "id": [
        "Audit",
        "Peninjauan/pengaturan sitemap dan robots",
        "Metadata",
        "Perbaikan dasar hingga 5 halaman"
      ]
    },
    "exclusions": {
      "en": [],
      "id": []
    }
  },
  {
    "id": "seo-growth",
    "slugs": {
      "en": "seo-growth",
      "id": "pertumbuhan-seo"
    },
    "category": "seo",
    "price": {
      "currency": "IDR",
      "amount": 1500000,
      "kind": "starting",
      "interval": "month"
    },
    "inquiry": "quote",
    "sessionMinutes": null,
    "revisionRounds": null,
    "name": {
      "en": "SEO Growth",
      "id": "Pertumbuhan SEO"
    },
    "description": {
      "en": "Maintain a structured organic growth effort.",
      "id": "Jalankan upaya pertumbuhan organik yang terstruktur."
    },
    "scope": {
      "en": [
        "Monitoring",
        "On-page improvements",
        "Content planning",
        "Reporting",
        "Recommended minimum engagement: 3 months"
      ],
      "id": [
        "Pemantauan",
        "Perbaikan on-page",
        "Perencanaan konten",
        "Pelaporan",
        "Rekomendasi kerja sama minimum: 3 bulan"
      ]
    },
    "exclusions": {
      "en": [
        "Article production, backlinks, and visual content unless separately quoted"
      ],
      "id": [
        "Produksi artikel, backlink, dan konten visual kecuali ditawarkan terpisah"
      ]
    }
  },
  {
    "id": "tracking-basic",
    "slugs": {
      "en": "tracking-basic",
      "id": "tracking-dasar"
    },
    "category": "tracking",
    "price": {
      "currency": "IDR",
      "amount": 450000,
      "kind": "fixed",
      "interval": "once"
    },
    "inquiry": "service",
    "sessionMinutes": null,
    "revisionRounds": 1,
    "name": {
      "en": "Tracking Basic",
      "id": "Tracking Dasar"
    },
    "description": {
      "en": "Set up a focused set of measurement events.",
      "id": "Siapkan event pengukuran yang terarah."
    },
    "scope": {
      "en": [
        "GA4 and Google Tag Manager",
        "Up to 3 events",
        "Testing"
      ],
      "id": [
        "GA4 dan Google Tag Manager",
        "Hingga 3 event",
        "Pengujian"
      ]
    },
    "exclusions": {
      "en": [],
      "id": []
    }
  },
  {
    "id": "ads-tracking",
    "slugs": {
      "en": "ads-tracking",
      "id": "tracking-iklan"
    },
    "category": "tracking",
    "price": {
      "currency": "IDR",
      "amount": 650000,
      "kind": "fixed",
      "interval": "once"
    },
    "inquiry": "service",
    "sessionMinutes": null,
    "revisionRounds": null,
    "name": {
      "en": "Ads Tracking",
      "id": "Tracking Iklan"
    },
    "description": {
      "en": "Connect website measurement with advertising tracking.",
      "id": "Hubungkan pengukuran website dengan tracking iklan."
    },
    "scope": {
      "en": [
        "GA4 and GTM",
        "Meta Pixel or Google Ads tracking",
        "Up to 8 events"
      ],
      "id": [
        "GA4 dan GTM",
        "Meta Pixel atau tracking Google Ads",
        "Hingga 8 event"
      ]
    },
    "exclusions": {
      "en": [],
      "id": []
    }
  },
  {
    "id": "advanced-tracking",
    "slugs": {
      "en": "advanced-tracking",
      "id": "tracking-lanjutan"
    },
    "category": "tracking",
    "price": {
      "currency": "IDR",
      "amount": 1000000,
      "kind": "starting",
      "interval": "once"
    },
    "inquiry": "quote",
    "sessionMinutes": null,
    "revisionRounds": null,
    "name": {
      "en": "Advanced Tracking",
      "id": "Tracking Lanjutan"
    },
    "description": {
      "en": "Scope measurement for more complex requirements.",
      "id": "Tentukan scope pengukuran untuk kebutuhan yang lebih kompleks."
    },
    "scope": {
      "en": [
        "Scope discovery for multi-platform tracking, custom events, data layer, CAPI, or server-side requirements",
        "Implementation scope is confirmed in the quote"
      ],
      "id": [
        "Penelusuran scope untuk tracking multiplatform, event khusus, data layer, CAPI, atau kebutuhan server-side",
        "Scope implementasi dikonfirmasi dalam penawaran"
      ]
    },
    "exclusions": {
      "en": [],
      "id": []
    }
  },
  {
    "id": "meta-ads-starter",
    "slugs": {
      "en": "meta-ads-starter",
      "id": "meta-ads-starter"
    },
    "category": "ads",
    "price": {
      "currency": "IDR",
      "amount": 850000,
      "kind": "fixed",
      "interval": "month"
    },
    "inquiry": "service",
    "sessionMinutes": null,
    "revisionRounds": null,
    "name": {
      "en": "Meta Ads Starter",
      "id": "Meta Ads Starter"
    },
    "description": {
      "en": "Run a focused Meta campaign with client-supplied assets.",
      "id": "Jalankan kampanye Meta terarah dengan aset dari klien."
    },
    "scope": {
      "en": [
        "1 campaign",
        "Up to 2 ad sets",
        "Client-supplied creative assets",
        "Campaign monitoring, optimization, and monthly report"
      ],
      "id": [
        "1 kampanye",
        "Hingga 2 ad set",
        "Aset kreatif disediakan klien",
        "Pemantauan kampanye, optimasi, dan laporan bulanan"
      ]
    },
    "exclusions": {
      "en": [
        "Ad spend"
      ],
      "id": [
        "Biaya iklan"
      ]
    }
  },
  {
    "id": "meta-ads-growth",
    "slugs": {
      "en": "meta-ads-growth",
      "id": "meta-ads-growth"
    },
    "category": "ads",
    "price": {
      "currency": "IDR",
      "amount": 1250000,
      "kind": "fixed",
      "interval": "month"
    },
    "inquiry": "service",
    "sessionMinutes": null,
    "revisionRounds": null,
    "name": {
      "en": "Meta Ads Growth",
      "id": "Meta Ads Growth"
    },
    "description": {
      "en": "Support testing and retargeting across Meta campaigns.",
      "id": "Dukung pengujian dan retargeting dalam kampanye Meta."
    },
    "scope": {
      "en": [
        "Up to 2 campaigns",
        "Testing and retargeting",
        "Weekly optimization",
        "Reporting"
      ],
      "id": [
        "Hingga 2 kampanye",
        "Pengujian dan retargeting",
        "Optimasi mingguan",
        "Pelaporan"
      ]
    },
    "exclusions": {
      "en": [
        "Ad spend"
      ],
      "id": [
        "Biaya iklan"
      ]
    }
  },
  {
    "id": "google-ads-starter",
    "slugs": {
      "en": "google-ads-starter",
      "id": "google-ads-starter"
    },
    "category": "ads",
    "price": {
      "currency": "IDR",
      "amount": 1000000,
      "kind": "fixed",
      "interval": "month"
    },
    "inquiry": "service",
    "sessionMinutes": null,
    "revisionRounds": null,
    "name": {
      "en": "Google Ads Starter",
      "id": "Google Ads Starter"
    },
    "description": {
      "en": "Build a basic Search campaign around relevant keywords.",
      "id": "Bangun kampanye Search dasar dengan kata kunci relevan."
    },
    "scope": {
      "en": [
        "Basic Search campaign",
        "Keyword setup",
        "Optimization",
        "Reporting"
      ],
      "id": [
        "Kampanye Search dasar",
        "Pengaturan kata kunci",
        "Optimasi",
        "Pelaporan"
      ]
    },
    "exclusions": {
      "en": [
        "Ad spend"
      ],
      "id": [
        "Biaya iklan"
      ]
    }
  },
  {
    "id": "integrated-ads-management",
    "slugs": {
      "en": "integrated-ads-management",
      "id": "pengelolaan-iklan-terintegrasi"
    },
    "category": "ads",
    "price": {
      "currency": "IDR",
      "amount": 1750000,
      "kind": "starting",
      "interval": "month"
    },
    "inquiry": "quote",
    "sessionMinutes": null,
    "revisionRounds": null,
    "name": {
      "en": "Integrated Ads Management",
      "id": "Pengelolaan Iklan Terintegrasi"
    },
    "description": {
      "en": "Define a coordinated advertising scope across channels.",
      "id": "Tentukan scope iklan yang terkoordinasi lintas kanal."
    },
    "scope": {
      "en": [
        "Meta and Google Ads or a more complex multi-channel funnel",
        "Channel mix and deliverables are confirmed in the quote"
      ],
      "id": [
        "Meta dan Google Ads atau funnel multikanal yang lebih kompleks",
        "Kombinasi kanal dan hasil kerja dikonfirmasi dalam penawaran"
      ]
    },
    "exclusions": {
      "en": [
        "Ad spend and creative production"
      ],
      "id": [
        "Biaya iklan dan produksi materi kreatif"
      ]
    }
  },
  {
    "id": "digital-business-consultation",
    "slugs": {
      "en": "digital-business-consultation",
      "id": "konsultasi-bisnis-digital"
    },
    "category": "strategy",
    "price": {
      "currency": "IDR",
      "amount": 150000,
      "kind": "fixed",
      "interval": "once"
    },
    "inquiry": "consultation",
    "sessionMinutes": 60,
    "revisionRounds": null,
    "name": {
      "en": "Digital Business Consultation",
      "id": "Konsultasi Bisnis Digital"
    },
    "description": {
      "en": "Discuss business priorities and practical next actions.",
      "id": "Diskusikan prioritas bisnis dan langkah praktis berikutnya."
    },
    "scope": {
      "en": [
        "60-minute consultation",
        "Consultation summary or practical action notes"
      ],
      "id": [
        "Konsultasi 60 menit",
        "Ringkasan konsultasi atau catatan tindakan praktis"
      ]
    },
    "exclusions": {
      "en": [],
      "id": []
    }
  },
  {
    "id": "career-consultation",
    "slugs": {
      "en": "career-consultation",
      "id": "konsultasi-karier"
    },
    "category": "career",
    "price": {
      "currency": "IDR",
      "amount": 100000,
      "kind": "fixed",
      "interval": "once"
    },
    "inquiry": "consultation",
    "sessionMinutes": 45,
    "revisionRounds": null,
    "name": {
      "en": "Career Consultation",
      "id": "Konsultasi Karier"
    },
    "description": {
      "en": "Discuss your career questions and direction.",
      "id": "Diskusikan pertanyaan dan arah karier Anda."
    },
    "scope": {
      "en": [
        "45-minute consultation"
      ],
      "id": [
        "Konsultasi 45 menit"
      ]
    },
    "exclusions": {
      "en": [],
      "id": []
    }
  },
  {
    "id": "cv-review",
    "slugs": {
      "en": "cv-review",
      "id": "review-cv"
    },
    "category": "career",
    "price": {
      "currency": "IDR",
      "amount": 75000,
      "kind": "fixed",
      "interval": "once"
    },
    "inquiry": "service",
    "sessionMinutes": null,
    "revisionRounds": null,
    "name": {
      "en": "CV Review",
      "id": "Review CV"
    },
    "description": {
      "en": "Identify practical improvements to your current CV.",
      "id": "Identifikasi perbaikan praktis pada CV Anda."
    },
    "scope": {
      "en": [
        "CV review",
        "Practical improvement notes"
      ],
      "id": [
        "Review CV",
        "Catatan perbaikan praktis"
      ]
    },
    "exclusions": {
      "en": [],
      "id": []
    }
  },
  {
    "id": "cv-rewrite-optimization",
    "slugs": {
      "en": "cv-rewrite-optimization",
      "id": "penulisan-optimasi-cv"
    },
    "category": "career",
    "price": {
      "currency": "IDR",
      "amount": 150000,
      "kind": "fixed",
      "interval": "once"
    },
    "inquiry": "service",
    "sessionMinutes": null,
    "revisionRounds": null,
    "name": {
      "en": "CV Rewrite & Optimization",
      "id": "Penulisan Ulang & Optimasi CV"
    },
    "description": {
      "en": "Improve the wording and structure of your CV.",
      "id": "Perbaiki penulisan dan struktur CV Anda."
    },
    "scope": {
      "en": [
        "CV rewrite",
        "Structural optimization"
      ],
      "id": [
        "Penulisan ulang CV",
        "Optimasi struktur"
      ]
    },
    "exclusions": {
      "en": [
        "Visual CV design"
      ],
      "id": [
        "Desain visual CV"
      ]
    }
  },
  {
    "id": "marketing-marketplace-audit",
    "slugs": {
      "en": "marketing-marketplace-audit",
      "id": "audit-marketing-marketplace"
    },
    "category": "strategy",
    "price": {
      "currency": "IDR",
      "amount": 200000,
      "kind": "fixed",
      "interval": "once"
    },
    "inquiry": "service",
    "sessionMinutes": 60,
    "revisionRounds": null,
    "name": {
      "en": "Marketing or Marketplace Audit",
      "id": "Audit Marketing atau Marketplace"
    },
    "description": {
      "en": "Review your marketing or marketplace priorities.",
      "id": "Tinjau prioritas marketing atau marketplace Anda."
    },
    "scope": {
      "en": [
        "60-minute audit session",
        "Written notes"
      ],
      "id": [
        "Sesi audit 60 menit",
        "Catatan tertulis"
      ]
    },
    "exclusions": {
      "en": [],
      "id": []
    }
  },
  {
    "id": "marketplace-growth-plan",
    "slugs": {
      "en": "marketplace-growth-plan",
      "id": "rencana-pertumbuhan-marketplace"
    },
    "category": "strategy",
    "price": {
      "currency": "IDR",
      "amount": 450000,
      "kind": "fixed",
      "interval": "once"
    },
    "inquiry": "service",
    "sessionMinutes": null,
    "revisionRounds": null,
    "name": {
      "en": "Marketplace Growth Plan",
      "id": "Rencana Pertumbuhan Marketplace"
    },
    "description": {
      "en": "Turn marketplace findings into practical priorities.",
      "id": "Ubah temuan marketplace menjadi prioritas praktis."
    },
    "scope": {
      "en": [
        "Audit",
        "Prioritization",
        "Practical growth plan"
      ],
      "id": [
        "Audit",
        "Penentuan prioritas",
        "Rencana pertumbuhan praktis"
      ]
    },
    "exclusions": {
      "en": [],
      "id": []
    }
  }
]

export const catalogPaths = { en: "/services", id: "/id/layanan" } as const
export function servicePath(service: CatalogService, locale: PublicLocale) {
  return catalogPaths[locale] + "/" + service.slugs[locale]
}
export function findService(locale: PublicLocale, slug: string) {
  return catalogServices.find(service => service.slugs[locale] === slug)
}
export function servicePrice(service: CatalogService, locale: PublicLocale) {
  const amount = new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID").format(service.price.amount)
  return (service.price.kind === "starting" ? (locale === "en" ? "Starts from " : "Mulai dari ") : "") + "Rp" + amount + (service.price.interval === "month" ? (locale === "en" ? "/month" : "/bulan") : "")
}
export function serviceInquiry(service: CatalogService, locale: PublicLocale) {
  const message = locale === "en"
    ? "Hello Adam’s Work, I’m interested in " + service.name.en + ". Please help me confirm the scope, price, and availability."
    : "Halo Adam’s Work, saya tertarik dengan " + service.name.id + ". Mohon bantu konfirmasi ruang lingkup, harga, dan ketersediaannya."
  return siteConfig.whatsappUrl + "?text=" + encodeURIComponent(message)
}
