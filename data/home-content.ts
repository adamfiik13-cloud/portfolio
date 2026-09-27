import base from "./site-config.json"
import type { PublicLocale } from "./public-content"

// Stable message IDs are shared across locales; edit copy here, not in visual components.
export const messages = {
  "hero.label": { "en": "Introduction", "id": "Pengantar" },
  "nav.skip": {
    "en": "Skip to main content",
    "id": "Lewati ke konten utama"
  },
  "nav.language": {
    "en": "Language",
    "id": "Bahasa"
  },
  "nav.main": {
    "en": "Main navigation",
    "id": "Navigasi utama"
  },
  "nav.mobile": {
    "en": "Mobile navigation",
    "id": "Navigasi mobile"
  },
  "nav.close": {
    "en": "Close menu",
    "id": "Tutup menu"
  },
  "nav.open": {
    "en": "Open menu",
    "id": "Buka menu"
  },
  "nav.top": {
    "en": "Adam’s Work — Back to top",
    "id": "Adam’s Work — Kembali ke atas"
  },
  "hero.think": {
    "en": "Think · Test · Learn",
    "id": "Pikirkan · Uji · Pelajari"
  },
  "hero.global": {
    "en": "For global businesses entering Indonesia: let’s discuss your website and digital growth needs.",
    "id": "Untuk bisnis global yang memasuki Indonesia: mari diskusikan kebutuhan website dan pertumbuhan digital Anda."
  },
  "hero.founder": {
    "en": "Led by Fikri Adam · Strategy and quality of work",
    "id": "Dipimpin Fikri Adam · Strategi dan kualitas pekerjaan"
  },
  "hero.experience": {
    "en": "Experience of Fikri Adam, founder of Adam’s Work",
    "id": "Pengalaman Fikri Adam, pendiri Adam’s Work"
  },
  "hero.avatar": {
    "en": "Cartoon portrait of Fikri Adam, Digital Marketing Strategist",
    "id": "Potret kartun Fikri Adam, ahli strategi pemasaran digital"
  },
  "hero.scroll": {
    "en": "Scroll",
    "id": "Gulir"
  },
  "about.aria": {
    "en": "About Adam’s Work and its founder",
    "id": "Tentang Adam’s Work dan pendirinya"
  },
  "about.curious": {
    "en": "Curious by default.",
    "id": "Selalu ingin tahu."
  },
  "about.years": {
    "en": "years in practice",
    "id": "tahun pengalaman"
  },
  "about.label": {
    "en": "About Adam’s Work",
    "id": "Tentang Adam’s Work"
  },
  "about.heading": {
    "en": "Clear strategy.",
    "id": "Strategi yang jelas."
  },
  "about.accent": {
    "en": "Close collaboration.",
    "id": "Kolaborasi yang dekat."
  },
  "about.body": {
    "en": "Adam’s Work is a studio led by Fikri Adam as founder, strategist, and quality lead. Fikri directs strategy and reviews the quality of work with the internal team. You work directly with the studio, from understanding your needs to deciding the next steps.",
    "id": "Adam’s Work adalah studio yang dipimpin Fikri Adam sebagai founder, strategist, dan quality lead. Fikri mengarahkan strategi dan meninjau kualitas pekerjaan bersama tim internal. Anda bekerja langsung dengan studio, dari memahami kebutuhan hingga menentukan langkah berikutnya."
  },
  "about.proof": {
    "en": "Its foundation is Fikri’s four years of experience across five industries, alongside mentoring 50+ digital marketing students at RevoU.",
    "id": "Fondasinya adalah pengalaman Fikri selama empat tahun di lima industri, serta mendampingi 50+ peserta digital marketing di RevoU."
  },
  "about.industries": {
    "en": "Industry experience",
    "id": "Pengalaman industri"
  },
  "about.skills": {
    "en": "Expertise",
    "id": "Keahlian"
  },
  "skill.landing": {
    "en": "Landing Page",
    "id": "Halaman arahan"
  },
  "skill.consultation": {
    "en": "Marketing Consultation",
    "id": "Konsultasi pemasaran"
  },
  "skill.testing": {
    "en": "Creative Testing",
    "id": "Pengujian materi kreatif"
  },
  "industry.property": {
    "en": "Property",
    "id": "Properti"
  },
  "industry.travel": {
    "en": "Travel",
    "id": "Pariwisata"
  },
  "industry.fitness": {
    "en": "Fitness",
    "id": "Kebugaran"
  },
  "industry.laundry": {
    "en": "Laundry",
    "id": "Penatu"
  },
  "services.aria": {
    "en": "Adam’s Work services",
    "id": "Layanan Adam’s Work"
  },
  "services.label": {
    "en": "Services",
    "id": "Layanan"
  },
  "services.heading": {
    "en": "Websites, SEO,",
    "id": "Website, SEO,"
  },
  "services.accent": {
    "en": "and digital growth.",
    "id": "dan digital growth."
  },
  "services.body": {
    "en": "Start with your business needs. We agree on priorities and scope before work begins.",
    "id": "Mulai dari kebutuhan bisnis Anda. Kita menyepakati prioritas dan ruang lingkup sebelum pekerjaan dimulai."
  },
  "process.aria": {
    "en": "Approach",
    "id": "Pendekatan"
  },
  "process.label": {
    "en": "How we work",
    "id": "Cara kerja"
  },
  "process.accent": {
    "en": "Start with understanding.",
    "id": "Mulai dengan pemahaman."
  },
  "process.body": {
    "en": "Understand the goals, agree on a direction, do the work, then review the results together.",
    "id": "Pahami tujuan, sepakati arah, jalankan pekerjaan, lalu tinjau hasilnya bersama."
  },
  "process.understand": {
    "en": "Understand",
    "id": "Pahami"
  },
  "process.understandBody": {
    "en": "Understand the business goals, audience, needs, and constraints.",
    "id": "Pahami tujuan bisnis, audiens, kebutuhan, dan batasannya."
  },
  "process.plan": {
    "en": "Plan",
    "id": "Rencanakan"
  },
  "process.planBody": {
    "en": "Agree on priorities, scope, and how to evaluate results.",
    "id": "Sepakati prioritas, ruang lingkup, dan cara menilai hasil."
  },
  "process.execute": {
    "en": "Execute",
    "id": "Kerjakan"
  },
  "process.executeBody": {
    "en": "Work on the agreed priorities with clear communication.",
    "id": "Kerjakan prioritas yang disepakati dengan komunikasi yang jelas."
  },
  "process.review": {
    "en": "Review",
    "id": "Tinjau"
  },
  "process.reviewBody": {
    "en": "Discuss results and lessons to decide the next steps.",
    "id": "Bahas hasil dan pembelajaran untuk menentukan langkah berikutnya."
  },
  "process.quote": {
    "en": "Data matters when it reveals",
    "id": "Data berarti ketika menunjukkan"
  },
  "process.quoteAccent": {
    "en": "what to do next.",
    "id": "langkah berikutnya."
  },
  "process.tools": {
    "en": "Tools in practice",
    "id": "Alat yang digunakan"
  },
  "contact.aria": {
    "en": "Contact",
    "id": "Kontak"
  },
  "contact.label": {
    "en": "Start a conversation",
    "id": "Mulai percakapan"
  },
  "contact.heading": {
    "en": "What would you like to build?",
    "id": "Apa yang ingin Anda bangun?"
  },
  "contact.accent": {
    "en": "Let’s find a direction together.",
    "id": "Kita cari arah bersama."
  },
  "contact.body": {
    "en": "Tell us about your business, website or marketing needs, and challenges. We discuss the scope before getting started.",
    "id": "Ceritakan bisnis, kebutuhan website atau pemasaran, dan tantangan Anda. Ruang lingkup pekerjaan dibicarakan sebelum kita mulai."
  },
  "contact.email": {
    "en": "Send Email",
    "id": "Kirim Email"
  },
  "contact.avatar": {
    "en": "Cartoon portrait of Fikri Adam",
    "id": "Potret kartun Fikri Adam"
  },
  "contact.availability": {
    "en": "Open to selected projects",
    "id": "Terbuka untuk proyek terpilih"
  },
  "footer.contact": {
    "en": "Studio contact",
    "id": "Kontak studio"
  },
  "projects.label": {
    "en": "Selected work",
    "id": "Karya pilihan"
  },
  "projects.heading": {
    "en": "Real work.",
    "id": "Pekerjaan nyata."
  },
  "projects.accent": {
    "en": "Real lessons.",
    "id": "Pembelajaran nyata."
  },
  "projects.body": {
    "en": "Selected work by Fikri Adam that forms the studio’s experience. Each project’s context, contributions, and results are presented as they are.",
    "id": "Pilihan pekerjaan Fikri Adam yang menjadi fondasi pengalaman studio. Konteks, kontribusi, dan hasil setiap proyek tetap disajikan apa adanya."
  },
  "projects.view": {
    "en": "View case study",
    "id": "Lihat studi kasus"
  },
  "projects.more": {
    "en": "More work",
    "id": "Karya lainnya"
  },
  "projects.open": {
    "en": "Open details",
    "id": "Buka detail"
  },
  "modal.close": {
    "en": "Close",
    "id": "Tutup"
  },
  "modal.outcomes": {
    "en": "Key outcomes",
    "id": "Hasil utama"
  },
  "modal.challenge": {
    "en": "Challenge",
    "id": "Tantangan"
  },
  "modal.contribution": {
    "en": "Contribution",
    "id": "Kontribusi"
  },
  "modal.impact": {
    "en": "Business impact",
    "id": "Dampak bisnis"
  },
  "modal.cta": {
    "en": "Discuss a Similar Project",
    "id": "Diskusikan Proyek Serupa"
  },
  "experience.aria": {
    "en": "Experience",
    "id": "Pengalaman"
  },
  "experience.label": {
    "en": "Founder’s experience",
    "id": "Pengalaman pendiri"
  },
  "experience.heading": {
    "en": "Built from",
    "id": "Dibangun dari"
  },
  "experience.accent": {
    "en": "hands-on practice.",
    "id": "praktik langsung."
  },
  "experience.body": {
    "en": "Fikri Adam’s experience before and behind Adam’s Work: from market testing to client campaigns.",
    "id": "Pengalaman Fikri Adam sebelum dan di balik Adam’s Work: dari pengujian pasar hingga kampanye klien."
  },
  "experience.highlight": {
    "en": "RevoU highlight",
    "id": "Sorotan RevoU"
  },
  "experience.role": {
    "en": "Team Lead · Digital Marketing",
    "id": "Pemimpin Tim · Pemasaran Digital"
  },
  "experience.lesson": {
    "en": "Turning lessons into confident action.",
    "id": "Mengubah pembelajaran menjadi tindakan yang percaya diri."
  },
  "experience.years": {
    "en": "years at RevoU",
    "id": "tahun di RevoU"
  },
  "experience.students": {
    "en": "students",
    "id": "peserta"
  },
  "experience.tests": {
    "en": "market tests",
    "id": "uji pasar"
  },
  "experience.moments": {
    "en": "RevoU team moments",
    "id": "Momen tim RevoU"
  },
  "experience.portrait": {
    "en": "Fikri Adam in a RevoU branded portrait",
    "id": "Potret Fikri Adam dengan identitas RevoU"
  },
  "experience.orientation": {
    "en": "RevoU digital marketing orientation team",
    "id": "Tim orientasi pemasaran digital RevoU"
  },
  "experience.session": {
    "en": "RevoU team learning session",
    "id": "Sesi belajar tim RevoU"
  },
  "experience.education": {
    "en": "Education",
    "id": "Pendidikan"
  },
  "experience.current": {
    "en": "2024 — Present",
    "id": "2024 — Sekarang"
  },
  "experience.specialist": {
    "en": "Digital Marketing Specialist",
    "id": "Spesialis Pemasaran Digital"
  },
  "experience.freelance": {
    "en": "Freelance",
    "id": "Lepas"
  },
  "experience.groperti": {
    "en": "GroPerti — SEO & organic growth",
    "id": "GroPerti — SEO & pertumbuhan organik"
  },
  "experience.fte": {
    "en": "FTE Renon — Meta Ads performance",
    "id": "FTE Renon — performa Meta Ads"
  },
  "experience.conscious": {
    "en": "ConsciousTravel — website, ads & SEO",
    "id": "ConsciousTravel — website, iklan & SEO"
  },
  "experience.lead": {
    "en": "Team Lead, Digital Marketing Course",
    "id": "Pemimpin Tim, Kursus Pemasaran Digital"
  },
  "experience.mentored": {
    "en": "Mentored 50+ digital marketing students",
    "id": "Mendampingi 50+ peserta pemasaran digital"
  },
  "experience.guided": {
    "en": "Guided 10+ market tests across Meta and Google Ads",
    "id": "Membimbing 10+ uji pasar melalui Meta dan Google Ads"
  },
  "experience.led": {
    "en": "Led learning teams for 2+ years",
    "id": "Memimpin tim belajar selama 2+ tahun"
  },
  "experience.intern": {
    "en": "Content Writer Intern",
    "id": "Magang Penulis Konten"
  },
  "experience.outreach": {
    "en": "Content placement and SEO outreach",
    "id": "Penempatan konten dan penjangkauan SEO"
  },
  "experience.research": {
    "en": "Researched 700–900 websites per week",
    "id": "Meriset 700–900 website per minggu"
  }
} as const
export type MessageId = keyof typeof messages

const siteCopy = {
  en: {
    headline: "Purposeful websites. Growth understood.",
    summary: "Adam’s Work helps growing businesses and global companies entering or operating in Indonesia connect websites, SEO, and digital marketing to clear business goals. Start with your needs, then decide on practical next steps together.",
    primaryCta: "Discuss Your Project", secondaryCta: "View Work",
    founderRole: base.founderRole,
    navigation: ["Services", "Work", "About", "How We Work", "Contact"],
    statLabels: base.stats.map(stat => stat.label),
    description: "Indonesia-based web, SEO and digital growth studio for growing businesses and global companies entering or operating in Indonesia. Led by Fikri Adam.",
  },
  id: {
    headline: base.headline, summary: base.summary,
    primaryCta: base.primaryCta, secondaryCta: base.secondaryCta,
    founderRole: "Pendiri, Ahli Strategi & Penanggung Jawab Kualitas",
    navigation: base.navigation.map(item => item.label),
    statLabels: ["tahun pengalaman", "peserta didampingi", "uji pasar", "industri"],
    description: "Studio website, SEO, dan digital growth untuk UMKM Indonesia, dipimpin Fikri Adam. Strategi yang jelas dan kolaborasi yang dekat.",
  },
} as const

export function getSiteContent(locale: PublicLocale) {
  const copy = siteCopy[locale]
  return { ...base, ...copy, locale,
    navigation: base.navigation.map((item, index) => ({ ...item, label: copy.navigation[index] })),
    stats: base.stats.map((stat, index) => ({ ...stat, label: copy.statLabels[index] })),
  }
}
