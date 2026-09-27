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
  outputs: Localized<string[]>
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
      "id": "Bisnis yang membutuhkan website baru atau ingin memperjelas kehadirannya secara online."
    },
    "problem": {
      "en": "An unclear website structure or functionality that does not match business needs.",
      "id": "Struktur website yang membingungkan atau fungsi yang belum sesuai kebutuhan bisnis."
    },
    "inputs": {
      "en": "Business goals, page priorities, available copy, brand assets, and relevant website access.",
      "id": "Tujuan bisnis, halaman prioritas, teks yang tersedia, aset merek, dan akses website yang relevan."
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
      "id": "Bisnis yang ingin meninjau atau memperbaiki dasar pencarian organiknya."
    },
    "problem": {
      "en": "Unclear search priorities, technical issues, or gaps in on-page content.",
      "id": "Prioritas SEO yang belum jelas, kendala teknis, atau kekurangan pada konten halaman."
    },
    "inputs": {
      "en": "Website URL, business priorities, target audience, and relevant search or website access.",
      "id": "Alamat website, prioritas bisnis, target audiens, serta akses website atau platform pencarian yang relevan."
    }
  },
  {
    "id": "tracking",
    "name": {
      "en": "Tracking & Analytics",
      "id": "Tracking & Analitik"
    },
    "description": {
      "en": "Understand what visitors do next.",
      "id": "Pahami aktivitas pengunjung website."
    },
    "audience": {
      "en": "Businesses that need clearer measurement of website or advertising activity.",
      "id": "Bisnis yang membutuhkan pengukuran aktivitas website atau iklan yang lebih jelas."
    },
    "problem": {
      "en": "Missing or unclear event measurement across the relevant platforms.",
      "id": "Event yang belum diukur atau pengukurannya belum jelas pada platform terkait."
    },
    "inputs": {
      "en": "Website details, measurement goals, event priorities, and authorized platform access.",
      "id": "Informasi website, tujuan pengukuran, event prioritas, dan izin akses ke platform terkait."
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
      "id": "Jalankan upaya menjangkau pelanggan secara terarah."
    },
    "audience": {
      "en": "Businesses preparing or managing paid advertising campaigns.",
      "id": "Bisnis yang sedang menyiapkan atau mengelola campaign iklan berbayar."
    },
    "problem": {
      "en": "Campaign setup, testing, or optimization priorities that need a clearer direction.",
      "id": "Penyiapan, pengujian, atau optimasi campaign yang membutuhkan prioritas lebih jelas."
    },
    "inputs": {
      "en": "Campaign goals, target audience, ad budget, available assets, and authorized advertising account access.",
      "id": "Tujuan campaign, target audiens, anggaran iklan, materi yang tersedia, dan izin akses ke akun iklan."
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
      "id": "Tentukan hal yang perlu didahulukan."
    },
    "audience": {
      "en": "Business owners and teams reviewing digital marketing or marketplace priorities.",
      "id": "Pemilik bisnis dan tim yang ingin meninjau prioritas pemasaran digital atau marketplace."
    },
    "problem": {
      "en": "Unclear priorities, competing ideas, or uncertainty about the next practical step.",
      "id": "Prioritas yang belum jelas, banyaknya pilihan ide, atau keraguan menentukan langkah berikutnya."
    },
    "inputs": {
      "en": "Business context, goals, current challenges, and relevant performance information.",
      "id": "Konteks bisnis, tujuan, tantangan saat ini, dan informasi kinerja yang relevan."
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
      "id": "Dukungan praktis untuk langkah profesional Anda."
    },
    "audience": {
      "en": "Individual professionals reviewing their career direction or CV.",
      "id": "Profesional yang ingin meninjau CV atau membahas arah kariernya."
    },
    "problem": {
      "en": "Unclear career priorities or a CV that needs review or better structure.",
      "id": "CV yang perlu diperbaiki atau pertanyaan tentang langkah karier berikutnya."
    },
    "inputs": {
      "en": "Current CV where relevant, career goals, target roles, and questions you want to discuss.",
      "id": "CV saat ini jika relevan, tujuan karier, posisi yang dituju, dan pertanyaan yang ingin dibahas."
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
      "id": "Landing page untuk memperkenalkan penawaran Anda dan memudahkan calon klien menghubungi bisnis."
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
        "Tampilan responsif",
        "Integrasi WhatsApp atau formulir pertanyaan",
        "Pengaturan SEO dasar"
      ]
    },
    "exclusions": {
      "en": [
        "Domain, hosting, full copywriting, premium assets, and advanced integrations"
      ],
      "id": [
        "Domain, hosting, penulisan seluruh konten, aset premium, dan integrasi lanjutan"
      ]
    },
    "outputs": {
      "en": [
        "A responsive landing page with the agreed sections and inquiry connection.",
        "Basic SEO configuration."
      ],
      "id": [
        "Landing page responsif dengan bagian dan sarana kontak sesuai kesepakatan.",
        "Pengaturan SEO dasar."
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
      "id": "Perkenalkan bisnis Anda melalui website dengan struktur yang jelas."
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
        "Tampilan responsif",
        "SEO dasar",
        "Analitik dasar",
        "CMS sederhana jika termasuk dalam cakupan yang disepakati"
      ]
    },
    "exclusions": {
      "en": [
        "Domain, hosting, complete copywriting, premium assets, and custom integrations"
      ],
      "id": [
        "Domain, hosting, penulisan seluruh konten, aset premium, dan integrasi khusus"
      ]
    },
    "outputs": {
      "en": [
        "A responsive business website with the agreed pages.",
        "Basic SEO and analytics configuration; a simple CMS only if agreed."
      ],
      "id": [
        "Website bisnis responsif dengan halaman sesuai kesepakatan.",
        "Pengaturan SEO dan analitik dasar; CMS sederhana jika disepakati."
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
      "id": "Rancang website sesuai kebutuhan yang tidak tercakup dalam paket standar."
    },
    "scope": {
      "en": [
        "Scope discovery for dashboards, authentication, payments, API integrations, custom workflows, or other non-standard functionality",
        "Specific functionality and deliverables are confirmed in the quote"
      ],
      "id": [
        "Pembahasan kebutuhan dashboard, autentikasi, pembayaran, integrasi API, alur kerja khusus, atau fungsi di luar standar",
        "Fungsi dan hasil pekerjaan ditetapkan dalam penawaran"
      ]
    },
    "exclusions": {
      "en": [],
      "id": []
    },
    "outputs": {
      "en": [
        "Website functionality and deliverables defined in the confirmed quote."
      ],
      "id": [
        "Fungsi website dan hasil pekerjaan sesuai penawaran yang disepakati."
      ]
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
      "id": "Audit SEO & Rencana Tindak Lanjut"
    },
    "description": {
      "en": "Identify search priorities and practical next steps.",
      "id": "Temukan prioritas SEO dan langkah perbaikan yang bisa dijalankan."
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
        "Temuan yang diurutkan berdasarkan prioritas",
        "Rencana tindak lanjut yang praktis"
      ]
    },
    "exclusions": {
      "en": [],
      "id": []
    },
    "outputs": {
      "en": [
        "Prioritized technical and keyword findings.",
        "A practical plan for the next actions."
      ],
      "id": [
        "Temuan teknis dan peluang kata kunci yang disusun berdasarkan prioritas.",
        "Rencana langkah perbaikan yang praktis."
      ]
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
      "id": "Benahi dasar SEO pada halaman yang menjadi prioritas."
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
        "Peninjauan atau pengaturan sitemap dan robots",
        "Metadata",
        "Perbaikan dasar pada maksimal 5 halaman"
      ]
    },
    "exclusions": {
      "en": [],
      "id": []
    },
    "outputs": {
      "en": [
        "Reviewed or configured sitemap, robots, and metadata.",
        "Basic SEO improvements on the agreed priority pages."
      ],
      "id": [
        "Sitemap, robots, dan metadata yang ditinjau atau diatur sesuai kebutuhan.",
        "Perbaikan SEO dasar pada halaman prioritas yang disepakati."
      ]
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
      "id": "Pengembangan SEO"
    },
    "description": {
      "en": "Maintain a structured organic growth effort.",
      "id": "Jalankan pengembangan pencarian organik secara terarah."
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
        "Perbaikan SEO on-page",
        "Perencanaan konten",
        "Pelaporan",
        "Disarankan bekerja sama minimal 3 bulan"
      ]
    },
    "exclusions": {
      "en": [
        "Article production, backlinks, and visual content unless separately quoted"
      ],
      "id": [
        "Penulisan artikel, backlink, dan konten visual, kecuali tercantum dalam penawaran terpisah"
      ]
    },
    "outputs": {
      "en": [
        "On-page improvements and content planning.",
        "Reporting from ongoing SEO monitoring."
      ],
      "id": [
        "Perbaikan SEO on-page dan perencanaan konten.",
        "Laporan dari pemantauan SEO."
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
      "id": "Siapkan pengukuran untuk sejumlah aktivitas penting di website."
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
    },
    "outputs": {
      "en": [
        "Tested GA4 and Google Tag Manager configuration for the agreed events."
      ],
      "id": [
        "Pengaturan GA4 dan Google Tag Manager untuk event yang disepakati, disertai pengujian."
      ]
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
      "id": "Hubungkan pengukuran aktivitas website dengan tracking iklan."
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
    },
    "outputs": {
      "en": [
        "GA4 and GTM configuration connected to Meta Pixel or Google Ads tracking for the agreed events."
      ],
      "id": [
        "Pengaturan GA4 dan GTM yang terhubung ke Meta Pixel atau tracking Google Ads untuk event yang disepakati."
      ]
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
      "id": "Tentukan pengaturan tracking untuk kebutuhan pengukuran yang lebih kompleks."
    },
    "scope": {
      "en": [
        "Scope discovery for multi-platform tracking, custom events, data layer, CAPI, or server-side requirements",
        "Implementation scope is confirmed in the quote"
      ],
      "id": [
        "Pembahasan kebutuhan tracking lintas platform, event khusus, data layer, CAPI, atau server-side tracking",
        "Cakupan penerapan ditetapkan dalam penawaran"
      ]
    },
    "exclusions": {
      "en": [],
      "id": []
    },
    "outputs": {
      "en": [
        "Tracking implementation for the requirements defined in the confirmed quote."
      ],
      "id": [
        "Penerapan tracking sesuai kebutuhan yang tercantum dalam penawaran yang disepakati."
      ]
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
      "id": "Jalankan campaign Meta yang terarah menggunakan materi dari klien."
    },
    "scope": {
      "en": [
        "1 campaign",
        "Up to 2 ad sets",
        "Client-supplied creative assets",
        "Campaign monitoring, optimization, and monthly report"
      ],
      "id": [
        "1 campaign",
        "Hingga 2 ad set",
        "Materi iklan disediakan oleh klien",
        "Pemantauan campaign, optimasi, dan laporan bulanan"
      ]
    },
    "exclusions": {
      "en": [
        "Ad spend"
      ],
      "id": [
        "Biaya iklan"
      ]
    },
    "outputs": {
      "en": [
        "A configured Meta campaign using the supplied creative assets.",
        "Monthly reporting alongside campaign monitoring and optimization."
      ],
      "id": [
        "Campaign Meta yang disiapkan menggunakan materi dari klien.",
        "Laporan bulanan beserta pemantauan dan optimasi campaign."
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
      "id": "Lakukan pengujian dan retargeting dalam campaign Meta."
    },
    "scope": {
      "en": [
        "Up to 2 campaigns",
        "Testing and retargeting",
        "Weekly optimization",
        "Reporting"
      ],
      "id": [
        "Hingga 2 campaign",
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
    },
    "outputs": {
      "en": [
        "Meta campaigns with testing and retargeting.",
        "Reporting alongside weekly optimization."
      ],
      "id": [
        "Campaign Meta dengan pengujian dan retargeting.",
        "Laporan beserta optimasi mingguan."
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
      "id": "Siapkan campaign pencarian dasar dengan kata kunci yang relevan."
    },
    "scope": {
      "en": [
        "Basic Search campaign",
        "Keyword setup",
        "Optimization",
        "Reporting"
      ],
      "id": [
        "Campaign pencarian dasar",
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
    },
    "outputs": {
      "en": [
        "A basic Search campaign with keyword setup.",
        "Reporting alongside campaign optimization."
      ],
      "id": [
        "Campaign pencarian dasar dengan pengaturan kata kunci.",
        "Laporan beserta optimasi campaign."
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
      "id": "Susun pengelolaan iklan yang terkoordinasi di berbagai kanal."
    },
    "scope": {
      "en": [
        "Meta and Google Ads or a more complex multi-channel funnel",
        "Channel mix and deliverables are confirmed in the quote"
      ],
      "id": [
        "Meta dan Google Ads atau alur pemasaran lintas kanal yang lebih kompleks",
        "Kombinasi kanal dan hasil pekerjaan ditetapkan dalam penawaran"
      ]
    },
    "exclusions": {
      "en": [
        "Ad spend and creative production"
      ],
      "id": [
        "Biaya iklan dan produksi materi kreatif"
      ]
    },
    "outputs": {
      "en": [
        "Advertising work across the channels and deliverables defined in the confirmed quote."
      ],
      "id": [
        "Pekerjaan iklan pada kanal dan hasil pekerjaan sesuai penawaran yang disepakati."
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
      "id": "Bahas prioritas bisnis dan langkah praktis berikutnya."
    },
    "scope": {
      "en": [
        "60-minute consultation",
        "Consultation summary or practical action notes"
      ],
      "id": [
        "Konsultasi 60 menit",
        "Ringkasan konsultasi atau catatan langkah tindak lanjut"
      ]
    },
    "exclusions": {
      "en": [],
      "id": []
    },
    "outputs": {
      "en": [
        "A consultation focused on business priorities.",
        "A consultation summary or practical action notes."
      ],
      "id": [
        "Sesi konsultasi yang membahas prioritas bisnis.",
        "Ringkasan konsultasi atau catatan langkah tindak lanjut."
      ]
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
      "id": "Bahas pertanyaan dan arah karier Anda."
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
    },
    "outputs": {
      "en": [
        "A consultation to discuss your career questions and direction."
      ],
      "id": [
        "Sesi konsultasi untuk membahas pertanyaan dan arah karier Anda."
      ]
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
      "id": "Temukan bagian CV yang perlu diperbaiki beserta saran praktisnya."
    },
    "scope": {
      "en": [
        "CV review",
        "Practical improvement notes"
      ],
      "id": [
        "Review CV",
        "Catatan saran perbaikan"
      ]
    },
    "exclusions": {
      "en": [],
      "id": []
    },
    "outputs": {
      "en": [
        "Practical notes identifying improvements to your CV."
      ],
      "id": [
        "Catatan saran perbaikan berdasarkan review CV Anda."
      ]
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
      "id": "Perbaiki pilihan kata dan struktur CV Anda."
    },
    "scope": {
      "en": [
        "CV rewrite",
        "Structural optimization"
      ],
      "id": [
        "Penulisan ulang CV",
        "Perbaikan struktur"
      ]
    },
    "exclusions": {
      "en": [
        "Visual CV design"
      ],
      "id": [
        "Desain visual CV"
      ]
    },
    "outputs": {
      "en": [
        "A rewritten CV with improved wording and structure; visual design is not included."
      ],
      "id": [
        "CV yang ditulis ulang dengan pilihan kata dan struktur yang lebih baik; tidak termasuk desain visual."
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
      "id": "Audit Pemasaran atau Marketplace"
    },
    "description": {
      "en": "Review your marketing or marketplace priorities.",
      "id": "Tinjau prioritas pemasaran atau marketplace bisnis Anda."
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
    },
    "outputs": {
      "en": [
        "Written notes from the marketing or marketplace audit session."
      ],
      "id": [
        "Catatan tertulis dari sesi audit pemasaran atau marketplace."
      ]
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
      "id": "Susun prioritas dan langkah praktis berdasarkan hasil audit marketplace."
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
        "Rencana pertumbuhan yang praktis"
      ]
    },
    "exclusions": {
      "en": [],
      "id": []
    },
    "outputs": {
      "en": [
        "A practical marketplace growth plan with priorities based on the audit."
      ],
      "id": [
        "Rencana pertumbuhan marketplace yang praktis, dengan prioritas berdasarkan hasil audit."
      ]
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
